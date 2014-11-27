define(function(require) {

  var CollisionSystem = require('collision-system');
  var Entities = require('entities');
  var GameState = require('game-state');

  /**
   * @param {PIXI.DisplayObjectContainer} root
   * @constructor
   */
  function World(root) {

    /** All game objects in the world. */
    this.entities = new Entities(root);

    /** Reolves collisions among game objects. */
    this.collisions = new CollisionSystem();
  };


  World.prototype.update = function() {
    this.entities.updateAll();
    this.collisions.check(this.entities);
  };


  World.prototype.add = function(obj) {
    obj.world = this;
    this.entities.add(obj);
    this.collisions.register(obj);
  };


  World.prototype.remove = function(obj) {
    if (obj.dead) {
      return;
    }

    obj.dead = true;
    obj.world = null;
    this.entities.remove(obj);
    this.collisions.unregister(obj);
  };


  World.prototype.clearAll = function() {
    this.entities.clearAll();
    this.collisions.clearAll();
  };


  /**
   *
   */
  World.prototype.moveBy = function(obj, vector) {
    this.collisions.move(obj, vector);
  };


  /**
   *
   */
  World.prototype.moveTo = function(obj, vector) {
    this.collisions.moveTo(obj, vector);
  };

  World.prototype.isOffscreen = function(obj) {
    // TODO(scott): Switch this to use world bounds - we now
    // support pan and zoom.
    var sWidth = GameState.screen.width;
    var sHeight = GameState.screen.height;

    return obj.x + obj.radius < 0 ||
        obj.x - obj.radius > sWidth ||
        obj.y + obj.radius < 0 ||
        obj.y - obj.radius > sHeight;
  };

  World.prototype.findWithinRadius = function(point, radius) {
    return this.collisions.findWithinRadius(point, radius);
  };

  return World;
});

