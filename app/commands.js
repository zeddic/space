define(function(require) {

  var GameState = require('game-state');
  var Interval = require('util/interval');
  var Ship = require('ship');
  var behaviors = require('behaviors');
  var Color = require('util/color');

  /**
   * Detects and handles user input.
   */
  Commands = function(root, stage, world, camera) {

    this.camera = camera;

    this.world = world;

    /** @type {Vector} */
    this.mouse = null;

    this.mouseDown = false;

    this.listenForEvents(stage, root);

    this.iSpawn = new Interval(30).target(this.spawnShip, this);

    this.spawnColor = Color.RED;

    this.spawnBehavior = behaviors.FlyAtTarget;

    this.spawnRotation = 0;
  };

  Commands.prototype.listenForEvents = function(stage, root) {
    var self = this;

    stage.mousemove = function(data) {
      var point = data.getLocalPosition(root);

      GameState.mouse = point;
      self.mouse = point;//data.global;
    };

    stage.mousedown = function(data) {
      self.mouse = data.getLocalPosition(root); //data.global;
      self.mouseDown = true;
    };

    stage.mouseup = function(data) {
      self.mouseDown = false;
    };
  };

  Commands.prototype.update = function() {

    this.iSpawn.updateOnly();

    if (this.mouseDown) {
      this.iSpawn.trigger();
    }
  };

  Commands.prototype.setSpawnColor = function(color) {
    this.spawnColor = color;
  };

  Commands.prototype.setSpawnBehavior = function(behavior) {
    this.spawnBehavior = behavior;
  };

  Commands.prototype.setSpawnRotation = function(rotation) {
    this.spawnRotation = rotation;
  };

  Commands.prototype.spawnShip = function() {
    var ship = new Ship(this.mouse.x, this.mouse.y, this.spawnColor);
    ship.target = this.mouse;
    ship.rotation = this.spawnRotation;
    ship.behavior = new this.spawnBehavior(ship);
    this.world.add(ship);
  };

  return Commands;
})

