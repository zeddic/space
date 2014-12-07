
define(function(require) {

  var PIXI = require('lib/pixi');
  var Color = require('util/color');
  var GameObjectPrototype = require('game-object');
  var mixins = require('mixins');

  /**
   * @constructor
   */
  Planet = function(x, y, tint) {
    this.setup({
      type: 'planet',
      x: x,
      y: y,
      /*tint: tint || Color.random(), */
      width: 200,
      height: 200,
      radius: 100,
      mass: 99999
    });

    this.anchor.x = .5;
    this.anchor.y = .5;
  };


  Planet.prototype = Object.create(GameObjectPrototype);
  mixins.physics(Planet.prototype);

  Planet.prototype.texture = PIXI.Texture.fromImage('textures/planet.png', false, PIXI.scaleModes.NEAREST);


  /**
   *
   */
  Planet.prototype.update = function() {

  };


  return Planet;
});
