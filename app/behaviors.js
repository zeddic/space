

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
  var MAX_FORCE = .035;
  var FLEE_RANGE = 50;
  var trash, target;
  var otherShips = [];
  var iFindTarget = new Interval(1).randomize();
  var iFire = new Interval(1/2).randomize();

  function isBullet(obj) {
    return obj.type == 'bullet';/** && headingTowardsShip(obj); */
  }

  function isTarget(obj) {
    return obj.type == 'ship' && 
        obj !== ship &&
        obj.tint !== ship.tint;
  }

  function isOtherShip(obj) {
    return obj.type == 'ship' && 
        obj !== ship &&
        obj.tint == ship.tint;
  }

  function compareDistance(a, b) {
    var dA = ship.position.distanceToSq(a.position);
    var dB = ship.position.distanceToSq(b.position);
    return dA - dB;
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
      return new Vector(0, 0);//ship.velocity.clone().invert();
    }

    return seek(target).invert();
  }

  function pursue(target, opt_velocity) {
    var futurePosition = leadTarget(target, opt_velocity);
    return draw(seek(futurePosition));
  }

  function leadTarget(target, opt_velocity) {

    var velocity = opt_velocity || target.velocity;
    var maxPrediction = 60;

    var distance = Vector.delta(target, ship).len();

    var ticks = ship.velocity.isNull() ? 1 : distance / ship.velocity.len();
    ticks = Math.min(maxPrediction, ticks);

    var futurePosition = (target.position || target)
        .clone()
        .addMultiple(velocity, ticks);

    return futurePosition;
    //var updatesNeeded = distance2 / ship.velocity.len2();

    /*var squareSpeed = ship.velocity.len2();
    var predictionTime = maxPredictionTime;

    if (squareSpeed > 0) {
      var squarePredictionTime = squareDistance / squareSpeed;
      if (squarePredictionTime < maxPredictionTime * maxPredictionTime) {
        predictionTime = Math.sqrt(squarePredictionTime);
      }
    } */

    //var futurePosition = (target.position || target).clone()
    //    .addMultiple(targetVelocity, updatesNeeded);
  }

  function evade(target) {
    return pursue(target).invert();
  }

  var WANDER_CIRCLE_DISTANCE = SHIP_SPEED;
  var WANDER_CIRCLE_RADIUS = 2;
  var ANGLE_CHANGE = .2;
  var wanderRad = 0;

  function wander() {

    var desired = ship.velocity.isNull() ?
        Vector.fromRad(ship.rotation) :
        ship.velocity.clone().normalize();

    desired.multiply(WANDER_CIRCLE_DISTANCE);

    var displacement = Vector
        .fromRad(wanderRad)
        .multiply(WANDER_CIRCLE_RADIUS);


    var circleX = ship.x + desired.x;
    var circleY = ship.y + desired.y;

    /* drawCircleAt(
       circleX, circleY,
       WANDER_CIRCLE_RADIUS); */

    /*drawLine(
        circleX, circleY,
        circleX + displacement.x, circleY + displacement.y)*/

    desired.add(displacement);

    wanderRad += rand(-ANGLE_CHANGE/2, ANGLE_CHANGE/2);

    return draw(desired);
  }


  /**
   * Keeps the ships within a proximity of 'home'.
   * TODO(scott): Work out the 
   */
  function home(target, maxRange) {

    var desired = seek(target);
    var rangeSq = Vector.delta(target, ship.position).lengthSq();
    var maxRangeSq = maxRange * maxRange;
    var homesick = rangeSq / maxRangeSq;

    desired.scale(.4 + homesick);

    return draw(desired);
  }


  function arrive(target, range, offset) {

    offset = offset || 0;
    //var desired = seek(target);

    var desired = Vector.delta(target, ship.position);
    var len2 = desired.len2();

    desired.normalize().scale(SHIP_SPEED);

    if (len2 < range * range) {
      var distance = Math.sqrt(len2);
      var scale = (distance - offset) / (range - offset);
      scale = round(scale, 2);
      desired.scale(Math.max(0, scale));
    }

    desired.sub(ship.velocity);

    return draw(desired);
  }

  function gravitate(target, mass) {
    var desired = Vector.delta(target, ship.position);
    var len2 = desired.len2();

    var pull = 100 * mass / len2

    desired.normalize().scale(pull);
    return draw(desired);
  }

  function repel(target, mass) {
    return gravitate(target, mass).invert();
  }

  function broadside(target) {

    var desired = Vector.delta(target, ship.position);

    var optionA = Vector.of(desired.y, -desired.x);
    var optionB = Vector.of(-desired.y, desired.x);

    var da = Vector.delta(optionA, ship.velocity);
    var db = Vector.delta(optionB, ship.velocity);

    var lenA = round(da.len2(), 2);
    var lenB = round(db.len2(), 2);

    //if (lenA == lenB) {
    //  desired = randInt(0, 2) == 0 ? optionA : optionB;
    //} else {
      desired = lenA <= lenB ? optionA : optionB;
    //}

    var speed = ship.velocity.len();
    desired = desired.normalize().scale(speed);
    desired.sub(ship.velocity);

    return draw(desired);
  }


  var FOLLOW_LEADER_DISTANCE = 50;

  function follow(target) {

    var offsetV = target.velocity
        .clone()
        .normalize();

    var ahead = offsetV.clone().scale(15).add(target.position);
    var behind = offsetV.invert().scale(FOLLOW_LEADER_DISTANCE).add(target.position);


    var desired = new Vector();
    desired.add(seek(behind));

    var fleeRadius = 15;
    drawCircleAt(ahead.x, ahead.y, fleeRadius);
    if (ship.withinDistanceOf(ahead, fleeRadius) || ship.withinDistanceOf(target, 10)) {
      desired.add(evade(target))
    }

    //desired.add()

    // Creates a force to arrive at the behind point
    //force = force.add(arrive(behind));
 
    // Add separation force
    //force = force.add(separation());
 
    return desired;
  }

  function seperation(others, opt_start, opt_end) {

    var start = opt_start || 0;
    var end = opt_end || start;

    var desired = new Vector();
    var count = 0;

    for (var i = 0, other; other = others[i]; i++) {
      if (start && !ship.withinDistanceOf(other, start)) {
        continue;
      }

      desired.x += other.x - ship.x;
      desired.y += other.y - ship.y
      count++;
    }

    if (count == 0) {
      return desired;
    }

    desired.divideScalar(count);
    desired.invert().normalize();
    return desired;//.scale(SHIP_SPEED);
  }

  function alignment(others, opt_range) {

    var desired = new Vector();
    var count = 0;

    for (var i = 0, other; other = others[i]; i++) {
      if (opt_range && !ship.withinDistanceOf(other, opt_range)) {
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
    return desired;//.scale(SHIP_SPEED);
  }
  
  function cohesion(others, opt_range) {

    var center = new Vector();
    var count = 0;

    for (var i = 0, other; other = others[i]; i++) {
      if (opt_range && !ship.withinDistanceOf(other, opt_range)) {
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

    var desired = Vector.delta(center, ship.position);
    desired.normalize();
    return desired;

    /*desired = Vector.delta(target, )

    var desired = Vector.delta(target, ship.position);
    desired.normalize();
    desired.multiply(SHIP_SPEED);
    desired.sub(ship.velocity);

    desired.normalize();
    return desired.scale(SHIP_SPEED); */
  }

  function draw(v) {
    drawLine(ship.x, ship.y, ship.x + v.x, ship.y + v.y);
    return v;
  }

  function drawLine(x1, y1, x2, y2) {
    return;
    graphics.lineStyle(1, 0xFFFFFF, 1);
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
  }

  function drawCircleAt(x, y, radius) {
    return;
    graphics.lineStyle(1, 0xFFFFFF, 1);
    graphics.drawCircle(x, y, radius);
  }

  function drawLineToObj(obj) {
    drawLine(ship.x, ship.y, obj.x, obj.y);
  };

  var steering;

  this.update = function() {

    if (iFindTarget.update()) {
      findTarget();
      findOtherShips();
    }

    iFire.updateOnly();

    var mouse = global.mouse;
    target = mouse;
    var steering = new Vector();

    if (target) {
      //steering.add(wander());
      //steering.add(pursue(target));
      //steering.add(seek(target));
      //steering.add(repel(target, 100));
      //steering.add(repel(target, 50));
      
      steering.add(seek(target).scale(5));
      //steering.add(follow(target).scale(15));
      //steering.add(draw(seperation([target], 90).scale(15)));

      if (ship.withinDistanceOf(target, 300) && iFire.trigger()) {
      //  ship.fireBulletAt(leadTarget(target));
      }

      //steering.add(wander().scale(.1));
      //drawLineToObj(target);
    } else {
      //steering.add(wander());
    }


    steering.add(draw(seperation(otherShips, 20).scale(10)));
    steering.add(draw(alignment(otherShips, 30).scale(7)));
    steering.add(draw(cohesion(otherShips, 30).scale(5)));
    //steering.add(home(mouse, 400));


    //drawCircleAt(mouse.x, mouse.y, 400);

    //var steering = seek(mouse);
    //trash.forEach(function(bullet) {
    //  steering.add(flee(bullet).multiply(1))
    //});

    steering.truncate(MAX_FORCE);
    ship.velocity.add(steering).truncate(SHIP_SPEED);

    ship.lookAtVelocity();
    ship.updatePosition();


    //trash.forEach(drawLineToObj);
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
    target = global.mouse;

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


function FlockBehavior(ship) {
  var finder = new Finder(ship);
  var iFindOthers = new Interval(1).randomize();
  var steer = new Steering({
    entity: ship,
    maxForce: 2,
    maxSpeed: 4
  });

  var others = [];
  var bullets = [];

  var home = new Vector(700, 200);


  this.update = function() {
    if (iFindOthers.update()) {
      others = finder.find(400, finder.isOtherShip.bind(finder));
      bullets = finder.find(100, finder.isBullet.bind(finder));

      //findTarget();
      //findOtherShips();
    }

    target = global.mouse;

    var force = new Vector();
    //force.add(steer.arrive(target, 100, 50).scale(4));
    
    force.add(steer.wander());
    force.add(steer.home(home, 1000).scale(4));
    force.add(steer.seperation(others, 20).scale(10));
    force.add(steer.alignment(others, 30).scale(10));
    force.add(steer.cohesion(others, 80).scale(8));

    force.add(steer.seperation(bullets, 60).scale(50));

    //for (var i = 0, bullet; bullet = bullets[i]; i++) {
    //  force.add(steer.flee(bullet, 60).scale(20));
    //}
 
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

Finder.prototype.isOtherShip = function(obj) {
  return obj.type == 'ship' && 
      obj !== this.entity &&
      obj.tint == this.entity.tint;
};

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
