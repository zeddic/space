define(function(require) {

  var PIXI = require('lib/pixi');
  var Bullet = require('bullet');
  var GameObjectPrototype = require('game-object');
  var mixins = require('mixins');
  var Interval = require('./util/interval');

  /**
   * @constructor
   */
  Ship = function(x, y, tint) {
    this.setup({
      type: 'ship',
      x: x,
      y: y,
      mass: 5,
      radius: 8,
      tint: tint,
      width: 20,
      height: 20
    });

    this.target = null;
    this.anchor.x = .4;
    this.anchor.y = .5;
    this.speed = 0;
    this.maxHealth = 50;
    this.health = this.maxHealth;

    this.counter2 = 0;
    this.iFire = new Interval(1, true).target(this.fireBullet, this);
  };


  Ship.prototype = Object.create(GameObjectPrototype);
  mixins.physics(Ship.prototype);

  /**
   * @const {PIXI.Texture}
   */
  Ship.prototype.texture = PIXI.Texture.fromImage('textures/ship.png', false, PIXI.scaleModes.NEAREST);


  Ship.prototype.aim = function() {
    this.rotation += .025;
    this.velocity.fromRad(this.rotation, this.speed);
    return;

    if(!this.target) {
      return;
    }

    var target = this.target;
    var dX = target.x - this.x;
    var dY = target.y - this.y;
    var distance = this.position.distanceTo(target);

    if (distance < this.waitDistance) {
      this.velocity.set(0, 0);
      return;
    }

    var scaler = Math.min(distance, this.speed);
    this.velocity.x = dX;
    this.velocity.y = dY;
    this.velocity.normalize();
    this.velocity.x *= scaler;
    this.velocity.y *= scaler;

    this.lookAtVelocity();
  };


  Ship.prototype.userControl = function() {

    if (Key.isDown(Key.W)) {
      this.speed = 2;
    } else if (Key.isDown(Key.S)) {
      this.speed = -1;
    } else {
      this.speed = 0;
    }

    if (Key.isDown(Key.A)) {
      this.rotation -= .10;
    }

    if (Key.isDown(Key.D)) {
      this.rotation += .10;
    }

    if (Key.isDown(Key.SPACE)) {
      this.iFire.trigger();
    }

    this.velocity.fromRad(this.rotation, this.speed);
  };


  Ship.prototype.collide = function(other) {

    if (other.type == 'bullet' && other.tint != this.tint) {
      this.health = Math.max(0, this.health - 5);
      if (this.health == 0) {
        this.world.remove(this);
      }
    }
  };


  Ship.prototype.update = function() {
    //this.iFire.updateOnly();

    //this.userControl();
    //this.updatePosition();

    // todo(baileys): add a simple collection for updateable things.
    this.behavior && this.behavior.update();
    this.tail && this.tail.update();

    var healthY = this.y + 15;
    var healthX = this.x - 10;
    var totalHealthLength = 10 * 2;
    var healthLength = totalHealthLength * (this.health / this.maxHealth);

    // graphics.lineStyle(4, 0x575757, .6);
    // graphics.moveTo(healthX, healthY);
    // graphics.lineTo(healthX + totalHealthLength, healthY);

    // graphics.lineStyle(4, 0xed1414, .6);
    // graphics.moveTo(healthX, healthY);
    // graphics.lineTo(healthX + healthLength, healthY);
  };


  Ship.prototype.findTarget = function() {
    this.counter2++;
    if (this.counter2 > 60 * 5) {
      this.counter2 = 0;
      var others = space.collisions.findWithinRadius(this.position, 500);


      var self = this;

      function isShip(obj) {
        return obj.type == 'ship' && obj !== self;
      }

      function compareDistance(a, b) {
        var dA = self.position.distanceToSq(a.position);
        var dB = self.position.distanceToSq(b.position);
        return dA - dB;
      }

      others = others.filter(isShip).sort(compareDistance);
      this.target = others[0];
    }
  };


  Ship.prototype.fireBulletAt = function(target, opt_speed) {
    var speed = opt_speed || this.speed + 2;
    var offset = this.radius + .5;

    var dir = Vector.delta(target, this.position).normalize();

    var bullet = new Bullet();
    bullet.tint = this.tint;
    bullet.velocity = dir.clone().scale(speed);
    bullet.position = dir.scale(offset).add(this.position);
    this.world.add(bullet);
  };

  Ship.prototype.fireBullet = function(opt_speed) {
    var speed = opt_speed || 6;
    var bullet = new Bullet();
    bullet.tint = this.tint;
    bullet.velocity = this.directionVector(0, opt_speed);
    bullet.position = this.radiusPointByRad(0, bullet.radius + .5);
    this.world.add(bullet);
  };

  return Ship;
});
