

function ErraticBehavior(ship) {
  this.ship = ship;
  var BULLET_SPEED = 1.5;

  this.iChangeDirection = new Interval(1, true).target(this.changeDirection, this);
  this.iFireBullet = new Interval(1).target(this.ship.fireBullet.bind(this.ship, BULLET_SPEED));

  this.turnLeft = false;

  this.ship.velocity = Vector.fromRad(ship.rotation, 1);
};

ErraticBehavior.prototype.update = function() {
  var delta = .05;
  delta = this.turnLeft ? delta * -1 : delta;
  this.ship.velocity.rotate(delta);

  this.ship.updatePosition();
  this.ship.lookAtVelocity();
  this.iChangeDirection.update();
  this.iFireBullet.update();
};

ErraticBehavior.prototype.changeDirection = function() {
  this.turnLeft = (randInt(0, 2) == 1);
  this.iChangeDirection.randomize();
};


function FlyAtTarget(ship) {

  var State = {
    ATTACK: 'attack',
    AVOID: 'avoid',
    FLY_BY: 'flyBy',
    IDLE: 'idle'
  }

  var SHIP_SPEED = 1;
  var BULLET_SPEED = 2;
  var TURN_SPEED = .06;
  var TOO_CLOSE_DISTANCE = 60;
  var AVOIDED_DISTANCE = 150;
  var FLY_BY_DISTANCE = 120;
  var DISTANCE_BUFFER = 20;
  var target;
  var iFindTarget = new Interval(1).randomize().target(findTarget).triggerOnNextUpdate();
  var iFireBullet = new Interval(2).target(ship.fireBullet.bind(ship, BULLET_SPEED));
  var iUpdateAvoidAngle = new Interval(1/2).target(decideAvoidAngle);
  var avoidDir = null;
  var flyByDir = null;

  var state = State.IDLE;


  function isTarget(obj) {
    return obj.type == 'ship' && 
        obj !== ship &&
        obj.tint !== ship.tint;
  }

  function compareDistance(a, b) {
    var dA = ship.position.distanceToSq(a.position);
    var dB = ship.position.distanceToSq(b.position);
    return dA - dB;
  }

  function findTarget() {
    var oldTarget = target;

    var others = ship.world.findWithinRadius(ship.position, 500);
    others = others.filter(isTarget).sort(compareDistance);
    target = others[0];

    if (target != oldTarget) {
      state = target ? State.ATTACK : State.IDLE;
    }
  }

  /**
   * Attempts to turn the ship by the given amount. Rate limited by the
   * ships max turn speed.
   */
  function turnShipBy(toTurn) {
    var sign = Math.sign(toTurn);
    ship.rotation += sign * Math.min(TURN_SPEED, Math.abs(toTurn));
  }

  /**
   * Attemps to turn the ship to the given radian. Rate limited by turn speed.
   */
  function turnShipTowards(targetRotation) {
    var toTurn = normalizeRad(targetRotation - ship.rotation);
    turnShipBy(toTurn);
  }

  function attack() {
    if (ship.withinDistanceOf(target, TOO_CLOSE_DISTANCE)) {
      state = randInt(0, 2) == 0 ? State.AVOID : State.FLY_BY;
    }

    // Estimate where the target will be based on when a bullet could reach it.
    var rawDelta = Vector.delta(target, ship);
    var distance = rawDelta.length();
    var lead = distance / BULLET_SPEED;
    var dX = (target.x + target.velocity.x * lead) - ship.x;
    var dY = (target.y + target.velocity.y * lead) - ship.y;

    // Point towards where the target will be.
    var delta = new Vector(dX, dY);
    var targetRotation = delta.rad();
    var toTurn = normalizeRad(targetRotation - ship.rotation);

    turnShipBy(toTurn);

    // If pointing in the right direction, fire.
    if (Math.abs(toTurn) < Math.PI/8) {
      iFireBullet.trigger(); 
    }

    // Move.
    ship.velocity.fromRad(ship.rotation, SHIP_SPEED);
    ship.updatePosition();
  }

  function decideAvoidAngle() {
    avoidDir = rand(Math.PI/1.5, Math.PI) * Math.sign(rand(-1, 1));
  }

  function avoid() {
    if (!ship.withinDistanceOf(target, AVOIDED_DISTANCE)) {
      state = State.ATTACK;
      avoidDir = null;
    }

    if (!avoidDir) {
      decideAvoidAngle();
    }

    iUpdateAvoidAngle.update();

    var targetRotation = Vector.delta(target, ship).rad() + avoidDir;
    turnShipTowards(targetRotation);
    ship.velocity.fromRad(ship.rotation, SHIP_SPEED);
    ship.updatePosition();
  }

  function flyBy() {

    if (!ship.withinDistanceOf(target, FLY_BY_DISTANCE)) {
      state = State.ATTACK;
      flyByDir = null;
    }

    if (!flyByDir) {
      var offsetDir = rand(-Math.PI/6, Math.PI/6);
      flyByDir = Vector.delta(target, ship).rad() + offsetDir;
    }

    turnShipTowards(flyByDir);
    ship.velocity.fromRad(ship.rotation, SHIP_SPEED);
    ship.updatePosition();
  }

  function idle() {
    ship.velocity.x = ship.velocity.y = 0;
  }

  this.update = function() {
    iFindTarget.update();
    iFireBullet.updateOnly();

    if (target && target.dead) {
      findTarget();
    }

    switch (state) {
      case State.ATTACK: attack(); break;
      case State.AVOID: avoid(); break;
      case State.IDLE: idle(); break;
      case State.FLY_BY: flyBy(); break;
    }

    // Draw line to current target.
    if (target) {
      graphics.lineStyle(4, 0xFFFFFF, .2);
      graphics.moveTo(ship.x, ship.y);
      graphics.lineTo(target.x, target.y);
    }
  }
};

function SpinyBehavior(ship) {
  var TURN_SPEED = .03;
  var iFireBullet = new Interval(10).target(ship.fireBullet, ship);

  this.update = function() {
    iFireBullet.update();
    ship.rotation -= TURN_SPEED;
  }
};

function SteeringBehavior(ship) {

  var SHIP_SPEED = 2;
  var MAX_FORCE = .05;
  var FLEE_RANGE = 50;
  var trash;

  function isTarget(obj) {
    return obj.type == 'bullet';/** && headingTowardsShip(obj); */
  }

  function compareDistance(a, b) {
    var dA = ship.position.distanceToSq(a.position);
    var dB = ship.position.distanceToSq(b.position);
    return dA - dB;
  }

  function findTarget() {
    var others = ship.world.findWithinRadius(ship.position, 75);
    trash = others.filter(isTarget).sort(compareDistance);
  }

  function turnShipBy(toTurn) {
    var sign = Math.sign(toTurn);
    ship.rotation += sign * Math.min(TURN_SPEED, Math.abs(toTurn));
  }

  function turnShipTowards(targetRotation) {
    var toTurn = normalizeRad(targetRotation - ship.rotation);
    turnShipBy(toTurn);
  }


  function headingTowardsShip(obj) {
    var dirTo = Vector.delta(ship, obj).rad();
    var heading = obj.velocity.rad();
    console.log(Math.abs(normalizeRad(dirTo - heading)));
    return Math.abs(normalizeRad(dirTo - heading)) < Math.PI/2;
  };


  function seek(target) {
    var desired = Vector.delta(target, ship.position);
    desired.normalize();
    desired.multiply(SHIP_SPEED);
    desired.sub(ship.velocity);
    return desired;
  }

  function flee(target, opt_range) {
    if (opt_range && !ship.withinDistanceOf(target, opt_range)) {
      return ship.velocity.clone().invert();
    }

    return seek(target).invert();
  };

  function drawLineTo(obj) {
    graphics.lineStyle(4, 0xFF0000, .2);
    graphics.moveTo(ship.x, ship.y);
    graphics.lineTo(obj.x, obj.y);
  };

  var steering;

  this.update = function() {
    findTarget();

    var mouse = global.mouse;

    var steering = seek(mouse);

    trash.forEach(function(bullet) {
      steering.add(flee(bullet).multiply(1))
    });

    steering.truncate(MAX_FORCE);
    ship.velocity.add(steering).truncate(SHIP_SPEED);

    ship.lookAtVelocity();
    ship.updatePosition();

    trash.forEach(drawLineTo);
  }
};

function NullBehavior() {
  this.update = function() {};
};






    /*if (trash && ship.withinDistanceOf(trash, AVOID_DISTANCE)) {

      if (headingTowardsShip(trash)) {
        return 'yes!';
      }

      var delta = Vector.delta(trash, ship);
      //var distance = rawDelta.length();
      //var lead = distance / BULLET_SPEED;
      //var dX = (target.x + target.velocity.x * lead) - ship.x;
      //var dY = (target.y + target.velocity.y * lead) - ship.y;

      // Point towards where the target will be.
      //var delta = new Vector(dX, dY);
      var targetRotation = delta.rad() + Math.PI/2;



      //var toTurn = normalizeRad(targetRotation - ship.rotation);



      //var avoidRad = trash.velocity.rad();
      ship.rotation = targetRotation;
      ship.velocity.fromRad(ship.rotation, SHIP_SPEED);
      ship.updatePosition();
    } */

    /*
    var steering = Vector.delta(desired, ship.velocity).truncate(MAX_FORCE);



    var force :Vector3D;
    var distance :Number;
 
    desired = target.subtract(host.getPosition());
 
    distance = desired.length;
    desired.normalize();
 
    if (distance <= slowingRadius) {
        desired.scaleBy(host.getMaxVelocity() * distance/slowingRadius);
    } else {
        desired.scaleBy(host.getMaxVelocity());
    }
 
    force = desired.subtract(host.getVelocity());
 
    return force;
    */

