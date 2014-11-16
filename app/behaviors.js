

function ErraticBehavior(ship) {
  this.ship = ship;

  this.iChangeDirection = new Interval(1, true).target(this.changeDirection, this);
  this.iFireBullet = new Interval(1, true).target(ship.fireBullet, ship);

  this.turnLeft = false;

  this.ship.velocity = Vector.fromRad(ship.rotation, 3);
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

  var BULLET_SPEED = 5;
  var TURN_SPEED = .09;
  var TOO_CLOSE_DISTANCE = 50;
  var target;
  var iFindTarget = new Interval(1).randomize().target(findTarget).triggerOnNextUpdate();
  var iFireBullet = new Interval(2).target(ship.fireBullet.bind(ship, BULLET_SPEED));

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
    var others = ship.world.findWithinRadius(ship.position, 500);
    others = others.filter(isTarget).sort(compareDistance);
    target = others[0];
  }

  this.update = function() {
    iFindTarget.update();
    iFireBullet.updateOnly();

    if (!target) {
      ship.velocity.x = ship.velocity.y = 0;
      return;
    }

    if (target.dead) {
      findTarget();
      return;
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

    if (distance < TOO_CLOSE_DISTANCE) {
      targetRotation = normalizeRad(targetRotation - Math.PI);
    }

    var toTurn = targetRotation - ship.rotation;

    // Turn towards it.
    if (toTurn > 0) {
      ship.rotation += Math.min(TURN_SPEED, Math.abs(toTurn));
    } else {
      ship.rotation -= Math.min(TURN_SPEED, Math.abs(toTurn));
    }

    // If it is within a certain radius, fire.
    if (Math.abs(toTurn) < Math.PI/8) {
      iFireBullet.trigger(); 
    }

    ship.velocity.fromRad(ship.rotation, 2);
    ship.updatePosition();

    // Draw a line to the target (todo: put behind debug mode)
    graphics.lineStyle(4, 0xFFFFFF, .2);
    graphics.moveTo(ship.x, ship.y);
    graphics.lineTo(target.x, target.y);
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