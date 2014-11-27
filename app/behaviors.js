define(function(require) {

  var GameState = require('game-state');
  var Interval = require('util/interval');
  var Steering = require('steering');
  var Vector = require('vector');
  var random = require('util/random');
  var util = require('util/util');

  function ErraticBehavior(ship) {
    this.ship = ship;
    var BULLET_SPEED = 1.5;

    this.iChangeDirection = new Interval(1, true).target(this.changeDirection, this);
    this.iFireBullet = new Interval(1).target(this.ship.fireBullet.bind(this.ship, BULLET_SPEED));
    this.turnLeft = false;
    this.ship.velocity = Vector.fromRad(ship.rotation, 1);
  };

  ErraticBehavior.prototype.update = function() {
    var delta = .02;
    delta = this.turnLeft ? delta * -1 : delta;
    this.ship.velocity.rotate(delta);

    this.ship.updatePosition();
    this.ship.lookAtVelocity();
    this.iChangeDirection.update();
    this.iFireBullet.update();
  };

  ErraticBehavior.prototype.changeDirection = function() {
    this.turnLeft = (random.valueInt(0, 1) == 1);
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
      var toTurn = util.normalizeRad(targetRotation - ship.rotation);
      turnShipBy(toTurn);
    }

    function attack() {
      if (ship.withinDistanceOf(target, TOO_CLOSE_DISTANCE)) {
        state = random.valueInt(0, 1) == 0 ? State.AVOID : State.FLY_BY;
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
      var toTurn = util.normalizeRad(targetRotation - ship.rotation);

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
      avoidDir = random.value(Math.PI/1.5, Math.PI) * Math.sign(random.value(-1, 1));
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
        var offsetDir = random.value(-Math.PI/6, Math.PI/6);
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


  function NullBehavior() {
    this.update = function() {};
  };


  function FollowMouseBehavior(ship) {
    var steer = new Steering({
      entity: ship,
      maxForce: .5
    });

    this.update = function() {
      target = GameState.mouse;

      var force = new Vector();

      if (target) {
        force.add(steer.arrive(target, 100, 50));
      } else {
        force.add(steer.wander());
      }

      steer.apply(force);
      ship.lookAtVelocity();
      ship.updatePosition();
    };
  };

  function WanderBehavior(ship) {
    var steer = new Steering({
      maxSpeed: 2,
      entity: ship,
      maxForce: .035
    });

    home = new Vector(1000, 1000);

    this.update = function() {
      target = global.mouse;

      var force = new Vector();

      force.add(steer.wander({
        distance: 10,
        radius: 5,
        change: 1
      }));

      force.add(steer.home(home, 1000));

      steer.apply(force);
      ship.lookAtVelocity();
      ship.updatePosition();
    };
  };


  function EatBehavior(ship) {
    var steer = new Steering({
      maxSpeed: 5,
      entity: ship,
      maxForce: .5
    });

    var home = new Vector(0, 0);
    var target;

    this.update = function() {
      var force = new Vector();
      force.add(steer.wander());
      force.add(steer.home(home, 1000).scale(20));

      steer.apply(force);
      ship.lookAtVelocity();
      ship.updatePosition();
    };
  };


  function FlockBehavior(ship) {
    var finder = new Finder(ship);
    var iFindOthers = new Interval(2).randomize();
    var steer = new Steering({
      entity: ship,
      maxForce: .5,
      maxSpeed: 4
    });

    var friends = [];
    var hunter = [];

    var home = new Vector(0, 0);

    this.update = function() {
      if (iFindOthers.update()) {
        friends = finder.find(300, finder.isFriendlyShip.bind(finder));
        hunter = finder.find(300, finder.isHunterShip.bind(finder));
      }

      var force = new Vector();
      force.add(steer.wander());
      force.add(steer.home(home, 1000).scale(4));
      force.add(steer.seperation(friends, 20).scale(10));
      force.add(steer.alignment(friends, 30).scale(10));
      force.add(steer.cohesion(friends, 80).scale(8));
      force.add(steer.seperation(hunter, 300).scale(15));

      //force.add(steer.seperation(bullets, 60).scale(50));

      steer.apply(force);
      ship.lookAtVelocity();
      ship.updatePosition();
    };
  };


  function Finder(entity) {
    this.entity = entity;
    this.distanceCompare = util.distance.comparer(entity);
  };

  Finder.prototype.find = function(radius, filterFn) {
    var others = this.entity.world.findWithinRadius(this.entity.position, radius);
    return others.filter(filterFn);
  };

  Finder.prototype.isBullet = function(obj) {
    return obj.type == 'bullet';/** && headingTowardsShip(obj); */
  };

  Finder.prototype.isTarget = function(obj) {
    return obj.type == 'ship' && 
        obj !== this.entity &&
        obj.tint !== this.entity.tint;
  };

  Finder.prototype.isFriendlyShip = function(obj) {
    return obj.type == 'ship' && 
        obj !== this.entity &&
        obj.tint == this.entity.tint;
  };

  Finder.prototype.isOtherShip = function(obj) {
    return obj.type == 'ship' && 
        obj !== this.entity &&
        obj.tint != this.entity.tint;
  };

  Finder.prototype.isHunterShip = function(obj) {
    return obj.type == 'ship' && 
        obj !== this.entity &&
        obj.hunter;
  };



  return {
    ErraticBehavior: ErraticBehavior,
    FlyAtTarget: FlyAtTarget,
    SpinyBehavior: SpinyBehavior,
    NullBehavior: NullBehavior,
    FollowMouseBehavior: FollowMouseBehavior,
    WanderBehavior: WanderBehavior,
    EatBehavior: EatBehavior,
    FlockBehavior: FlockBehavior
  };
});


/* 

  function isBullet(obj) {
  }

  function isTarget(obj) {

  }

  function isOtherShip(obj) {
  }

function findBullets() {
  var others = ship.world.findWithinRadius(ship.position, 75);
  trash = others.filter(isBullet).sort(compareDistance);
}

function findTarget() {
  var others = ship.world.findWithinRadius(ship.position, 500);
  target = others.filter(isTarget).sort(compareDistance)[0];
}

function findOtherShips() {
  otherShips = ship.world.findWithinRadius(ship.position, 100)
      .filter(isOtherShip);
}
 */
