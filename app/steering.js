define(function(require) {

  var Vector = require('vector');
  var random = require('util/random');
  var util = require('util/util');

  /**
   * 
   */
  function Steering(options) {
    this.entity = options.entity;
    this.maxSpeed = options.maxSpeed || 4;
    this.maxForce = options.maxForce || .05;

    this.wanderRad = random.value(0, Math.PI * 2);

    this.WANDER_CIRCLE_DISTANCE = this.maxSpeed;
    this.WANDER_CIRCLE_RADIUS = this.maxSpeed;
    this.WANDER_RADIUS_CHANGE = 1;
  };

  Steering.prototype.apply = function(force) {
    force.truncate(this.maxForce);
    this.entity.velocity.add(force).truncate(this.maxSpeed);
  };

  Steering.prototype.seek = function(target) {
    return Vector.delta(target, this.entity.position)
        .normalize()
        .scale(this.maxSpeed)
        .sub(this.entity.velocity);
  };

  Steering.prototype.flee = function(target, opt_range) {
    if (opt_range && !this.inRangeOf(target, opt_range)) {
      return new Vector(0, 0);
    }

    return this.seek(target).invert();
  };

  Steering.prototype.pursue = function(target, opt_velocity) {
    return this.seek(this.leadTarget(target, opt_velocity));
  };

  Steering.prototype.evade = function(target, opt_velocity) {
    return this.pursue(target, opt_velocity).invert();
  };

  Steering.prototype.wander = function(options) {
    options = options || {};
    var entity = this.entity;
    var distance = options.distance || this.WANDER_CIRCLE_DISTANCE;
    var radius = options.radius || this.WANDER_CIRCLE_RADIUS;
    var change = options.change || this.WANDER_RADIUS_CHANGE;

    var desired = entity.velocity.isNull() ?
        Vector.fromRad(entity.rotation) :
        entity.velocity.clone().normalize();

    this.wanderRad += random.value(-change/2, change/2);
    var displacement = Vector.fromRad(this.wanderRad).scale(radius);
    desired.scale(distance).add(displacement);

    return desired;
  };

  Steering.prototype.home = function(target, maxRange) {

    if (this.inRangeOf(target, maxRange)) {
      return new Vector(0, 0);
    }

    return this.seek(target);

    /*var range2 = Vector.delta(target, this.entity.position).len2();
    var maxRange2 = maxRange * maxRange;
    var homesick = range2 / maxRange2;

    return this.seek(target).scale(.4 + homesick); */
  };


  Steering.prototype.arrive = function(target, range, offset) {
    offset = offset || 0;

    var desired = Vector.delta(target, this.entity.position);
    var len2 = desired.len2();

    desired.normalize().scale(this.maxSpeed);

    if (len2 < range * range) {
      var distance = Math.sqrt(len2);
      var scale = (distance - offset) / (range - offset);
      scale = util.round(scale, 2);
      desired.scale(Math.max(0, scale));
    }

    desired.sub(this.entity.velocity);
    return desired;
  }

  Steering.prototype.gravitate = function(target, mass) {
    var desired = Vector.delta(target, this.entity.position);
    var len2 = desired.len2();

    var pull = 100 * mass / len2

    desired.normalize().scale(pull);
    return desired;
  };

  Steering.prototype.repel = function(target, mass) {
    return this.gravitate(target, mass).invert();
  };

  Steering.prototype.broadside = function(target) {
    var entity = this.entity;
    var desired = Vector.delta(target, entity.position);

    var optionA = Vector.of(desired.y, -desired.x);
    var optionB = Vector.of(-desired.y, desired.x);

    var da = Vector.delta(optionA, entity.velocity);
    var db = Vector.delta(optionB, entity.velocity);

    var lenA = util.round(da.len2(), 2);
    var lenB = util.round(db.len2(), 2);

    desired = lenA <= lenB ? optionA : optionB;

    var speed = this.entity.velocity.len();
    desired = desired.normalize().scale(speed);
    desired.sub(entity.velocity);
    return desired;
  };

  Steering.prototype.follow = function(target, offsetX, offsetY) {
    var entity = this.entity;
    var offsetV = target.velocity
        .clone()
        .normalize();

    var ahead = offsetV
        .clone()
        .scale(15)
        .add(target.position);

    var behind = offsetV
        .setX(offsetX)
        .setY(offsetY)
        .invert()
        .add(target.position);

    var desired = new Vector();
    desired.add(this.seek(behind));

    var fleeRadius = 15;
    if (entity.withinDistanceOf(ahead, fleeRadius) ||
        entity.withinDistanceOf(target, 10)) {

      desired.add(this.evade(target));
    }

    return desired;
  };

  Steering.prototype.seperation = function(others, opt_range) {
    var entity = this.entity;
    var desired = new Vector();
    var count = 0;

    for (var i = 0, other; other = others[i]; i++) {
      if (opt_range && !this.inRangeOf(other, opt_range)) {
        continue;
      }

      desired.x += other.x - entity.x;
      desired.y += other.y - entity.y
      count++;
    }

    if (count == 0) {
      return desired;
    }

    desired.divideScalar(count);
    desired.invert().normalize();
    return desired;
  };

  Steering.prototype.alignment = function(others, opt_range) {
    var desired = new Vector();
    var count = 0;

    for (var i = 0, other; other = others[i]; i++) {
      if (opt_range && !this.inRangeOf(other, opt_range)) {
        continue;
      }

      desired.x += other.velocity.x;
      desired.y += other.velocity.y;
      count++;
    }

    if (count == 0) {
      return desired;
    }

    desired.divideScalar(count);
    desired.normalize();
    return desired;
  };


  Steering.prototype.cohesion = function(others, opt_range) {
    var center = new Vector();
    var count = 0;

    for (var i = 0, other; other = others[i]; i++) {
      if (opt_range && !this.inRangeOf(other, opt_range)) {
        continue;
      }

      center.x += other.x;
      center.y += other.y;
      count++;
    }

    if (count == 0) {
      return center;
    }

    center.divideScalar(count);

    var desired = Vector.delta(center, this.entity.position);
    desired.normalize();
    return desired;
  }

  // UTILITY METHODS

  Steering.prototype.leadTarget = function(target, opt_velocity) {
    var entity = this.entity;
    var velocity = opt_velocity || target.velocity || new Vector(0, 0);
    var maxTicks = 60;
    var distance = Vector.delta(target, entity).len();
    var ticks = entity.velocity.isNull() ? 1 : distance / entity.velocity.len();
    ticks = Math.min(maxTicks, ticks);

    return (target.position || target)
        .clone()
        .addMultiple(velocity, ticks);
  };

  Steering.prototype.inRangeOf = function(target, range) {
    var p1 = this.entity.position;
    var p2 = target.position || target;
    var dX = p1.x - p2.x;
    var dY = p1.y - p2.y;

    return (dX * dX + dY * dY) < (range * range);
  };

  return Steering;
});

