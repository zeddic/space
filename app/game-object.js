define(function(require) {

  var PIXI = require('lib/pixi');
  var Vector = require('vector');
  var util = require('util/util');

  var GameObjectPrototype = Object.create(PIXI.Sprite.prototype);

  GameObjectPrototype.$inits = [];

  GameObjectPrototype.$inits.push(function(data) {
    PIXI.Sprite.call(this, data.texture || this.texture);
    this.position.x = data.x || 0;
    this.position.y = data.y || 0;
    this.radius = data.radius || 5;
    this.tint = data.tint || this.tint;
    this.width = data.width || this.width;
    this.height = data.height || this.height;
    this.type = data.type || this.type;
    this.dead = false;
    data.world && data.world.add(this);
  });

  GameObjectPrototype.setup = function(data) {
    for (var i = 0, fn; fn = this.$inits[i]; i++) {
      fn.call(this, data);
    }
  };

  GameObjectPrototype.left = function() {
    return this.position.x - this.width / 2;
  };

  GameObjectPrototype.top = function() {
    return this.position.y - this.height / 2;
  };

  GameObjectPrototype.right = function() {
    return this.position.x + this.width / 2;
  };

  GameObjectPrototype.bottom = function() {
    return this.position.y + this.height / 2;
  };

  /**
   * Returns an x/y world point on the objects radius in the given vector
   * direction. If opt_offset is set, the point will be offset that
   * many world units from the radius.
   */
  GameObjectPrototype.radiusPointByVector = function(vector, opt_offset) {
    var offset = opt_offset || 0;
    return vector.clone().
        normalize().
        multiplyScalar(this.radius + offset).
        add(this.position);
  };

  GameObjectPrototype.radiusPointByTarget = function(target, opt_offset) {
    return this.radiusPointByVector(
        target.clone().sub(this.position),
        opt_offset);
  };

  GameObjectPrototype.radiusPointByRad = function(rad, opt_offset) {
    var vector = this.directionVector(rad);
    return this.radiusPointByVector(vector, opt_offset);
  };

  GameObjectPrototype.directionVector = function(opt_rad, opt_length) {
    var rad = opt_rad || 0;
    return Vector.fromRad(rad + this.rotation, opt_length);
  };

  GameObjectPrototype.containsPoint = function(point) {
    return util.within(point, this);
  };

  GameObjectPrototype.update = function() {
    // To override.
  };

  GameObjectPrototype.isOffscreen = function() {
    return this.world ? this.world.isOffscreen(this) : true;
  };

  GameObjectPrototype.moveBy = function(vector) {
    this.world && this.world.moveBy(this, vector);
  };

  GameObjectPrototype.moveTo = function(vector) {
    this.world && this.world.moveTo(this, vector);
  };

  GameObjectPrototype.removeFromWorld = function() {
    this.world && this.world.remove(this);
  };


  GameObjectPrototype.withinDistanceOf = function(other, distance) {
    return util.withinDistance(this.position, other, distance);
  };

  return GameObjectPrototype;
});
