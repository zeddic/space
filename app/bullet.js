
define(function(require) {

  var PIXI = require('lib/pixi');
  var Color = require('util/color');
  var GameObjectPrototype = require('game-object');
  var mixins = require('mixins');


  /**
   * @constructor
   */
  Bullet = function(x, y, tint) {
    this.setup({
      type: 'bullet',
      x: x,
      y: y,
      tint: tint || Color.random(),
      width: 3,
      height: 3,
      radius: 2
    });

    this.anchor.x = .5;
    this.anchor.y = .5;
  };


  Bullet.prototype = Object.create(GameObjectPrototype);
  mixins.physics(Bullet.prototype);

  Bullet.prototype.texture = PIXI.Texture.fromImage('textures/bullet.png');


  /**
   *
   */
  Bullet.prototype.update = function() {
    this.updatePosition();

    if (this.isOffscreen()) {
      this.removeFromWorld();
    }
  };


  /**
   *
   */
  Bullet.prototype.collide = function(other) {
    if (other.type != 'bullet' && other.tint != this.tint) {
      this.removeFromWorld();
    }
  };

  return Bullet;
});