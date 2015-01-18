define(function(require) {

  var PIXI = require('lib/pixi');
  var GameState = require('game-state');
  var Interval = require('util/interval');
  var Vector = require('vector');
  var Key = require('key');

  function PlayerControl(ship) {

    var turnV = 0;
    var TURN_ACCEL = .0019;
    var MAX_TURN_RATE = .05;
    var TURN_RATE_DAMPEN = .0022;

    var force = new Vector(0, 0);
    var iFire = new Interval(15);

    this.update = function() {

      force.set(0, 0);

      if (Key.isDown(Key.W)) {
        force.add(ship.directionVector(0, .1));
      } else if (Key.isDown(Key.S)) {
        force.add(ship.directionVector(Math.PI, .1));
      }

      if (Key.isDown(Key.J)) {
        force.add(ship.directionVector(-Math.PI/2, .1));
      }

      if (Key.isDown(Key.K)) {
        force.add(ship.directionVector(Math.PI/2, .1));
      }

      if (Key.isDown(Key.A)) {
        turnV -= TURN_ACCEL;
        //ship.rotation -= .05;
      } else if (Key.isDown(Key.D)) {
        //ship.rotation += .05;
        turnV += TURN_ACCEL;
      } else {
        var dampenTurn = Math.min(Math.abs(turnV), TURN_RATE_DAMPEN);
        dampenTurn *= -1 * Math.sign(turnV);
        turnV += dampenTurn;
      }

      if (Key.isDown(Key.SPACE)) {
        if(iFire.trigger()) {
          ship.fireBullet(ship.velocity.len() + 9);
        }
      }

      if (!Key.isDown(Key.SHIFT)) {
        force.add(ship.velocity.clone().invert().truncate(.05));
      }


      iFire.updateOnly();

      force.truncate(.5);
      ship.velocity.add(force).truncate(4);
      ship.updatePosition();

      turnV = Math.max(-MAX_TURN_RATE, Math.min(MAX_TURN_RATE, turnV));

      ship.rotation += turnV;

    }
  }

  return PlayerControl;
});

