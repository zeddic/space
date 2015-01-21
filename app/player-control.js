define(function(require) {

  var PIXI = require('lib/pixi');
  var GameState = require('game-state');
  var Interval = require('util/interval');
  var Vector = require('vector');
  var Key = require('key');

  function PlayerControl(ship) {

    var DEFAULT_ACCEL = 0.1;
    var DEFAULT_MAX_ACCEL = 0.5;
    var DEFAULT_MAX_SPEED = 4;
    var DEFAULT_DAPEN_ACCEL = 0.05;

    var DEFAULT_ANG_ACCEL = .0019;
    var DEFAULT_MAX_ANG_SPEED = .05;
    var DEFAULT_DAPEN_ANG_ACCEL = .0022;


    /**
     * Acceleration left/right/back/forward when the arrow keys are pressed.
     * @type {number}
     */
    this.accel = DEFAULT_ACCEL;

    /**
     * The maximum acceleration the ship is able to experience in any one frame, 
     * combining the forces from all thrusters.
     * NOTE(scott): Do I need this?
     * @type {number}
     */
    this.maxAccel = DEFAULT_MAX_ACCEL;

    /**
     * The maximum ship speed. It will take time to reach this speed.
     * @type {number}
     */
    this.maxSpeed = DEFAULT_MAX_SPEED;

    /**
     * A dapening acceleration to apply to the ship every frame. This acceleration
     * will always be applied as an inverse to the ships current velocity and results
     * in the ship slowly drifting to a stop when the engines are turned off rather
     * than continuing to float away.
     * @type {number}
     */
    this.dapenAccel = DEFAULT_DAPEN_ACCEL;

    /**
     * The acceleration at which the ship can begin turning left/right.
     * @type {number}
     */
    this.angAccel = DEFAULT_ANG_ACCEL;

    /**
     * The maximum turn rate that the ship can reach.
     * @type {number}
     */
    this.maxAngSpeed = DEFAULT_MAX_ANG_SPEED;

    /**
     * A dapening acceleration to apply to the ship every frame it is not turning
     * manually. This results in the ship slowly stopping a turn on it's own once
     * the arrow keys are no longer pressed.
     * @type {number}
     */
    this.dapenAngAccel = DEFAULT_DAPEN_ANG_ACCEL;

    /**
     * The ships current angular speed.
     * @type {number}
     */
    this.angSpeed = 0;

    /**
     * The acceleration to force to apply in a frame.
     */
    var force = new Vector(0, 0);

    /**
     * An interval to rate limit how fast the guns can fire.
     */
    var iFire = new Interval(15);


    this.update = function() {

      force.set(0, 0);

      // Forward
      if (Key.isDown(Key.W)) {
        force.add(ship.directionVector(0, this.accel));
      }

      // Back
      if (Key.isDown(Key.S)) {
        force.add(ship.directionVector(Math.PI, this.accel));
      }

      // Strafe Left
      if (Key.isDown(Key.J)) {
        force.add(ship.directionVector(-Math.PI/2, this.accel));
      }

      // Strafe Right
      if (Key.isDown(Key.K)) {
        force.add(ship.directionVector(Math.PI/2, this.accel));
      }

      // Dappen Movement
      if (!Key.isDown(Key.SHIFT) && force.isNull()) {
        force.add(ship.velocity.clone().invert().truncate(this.dapenAccel));
      }

      // Turn Left, Right, and Auto Stop Turning
      if (Key.isDown(Key.A)) {
        this.angSpeed -= Number(this.angAccel);
      } else if (Key.isDown(Key.D)) {
        this.angSpeed += Number(this.angAccel);
      } else {
        var dampenTurn = Math.min(Math.abs(this.angSpeed), this.dapenAngAccel);
        dampenTurn *= -1 * Math.sign(this.angSpeed);
        this.angSpeed += dampenTurn;
      }

      // Fire Gun
      if (Key.isDown(Key.SPACE)) {
        if(iFire.trigger()) {
          ship.fireBullet(ship.velocity.len() + 9);
        }
      }
      iFire.updateOnly();


      // Apply Acceleration.
      force.truncate(this.maxAccel);
      ship.velocity.add(force).truncate(this.maxSpeed);
      ship.updatePosition();

      // Apply Angular Acceleration.
      this.angSpeed = Math.max(-this.maxAngSpeed, Math.min(this.maxAngSpeed, this.angSpeed));
      ship.rotation += this.angSpeed;
    }
  }

  return PlayerControl;
});

