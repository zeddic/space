define(function(require) {

  var GameState = require('game-state');
  var Interval = require('util/interval');
  var Ship = require('ship');
  var behaviors = require('behaviors');
  var Color = require('util/color');
  var Key = require('key');
  var util = require('util/util');


  /**
   * Indicates where a command was just issued.
   */
  Indicator = function(point) {
    this.iEnd = new Interval(4);
    this.point = point;
  };

  Indicator.prototype.update = function() {
    this.iEnd.updateOnly();

    var g = GameState.graphics;
    var point = this.point;

    g.lineStyle(2, 0x15FF00, .8);
    g.drawCircle(point.x, point.y, 1);
    g.drawCircle(point.x, point.y, 20 * this.iEnd.percent());
  };

  Indicator.prototype.isActive = function() {
    return !this.iEnd.isReady();
  };


  /**
   * Represents items currently selected to issue commands to.
   */
  Selection = function(items) {
    this.items = items || [];
  };

  Selection.prototype.update = function() {
    this.highlightItems_();
  };

  Selection.prototype.highlightItems_ = function() {
    var g = GameState.graphics;
    g.lineStyle(2, 0x15FF00, .8);
    for (var i = 0, item; item = this.items[i]; i++) {
      g.drawCircle(item.x, item.y, item.radius + 4);
    }
  };


  /**
   * Detects and handles user input.
   */
  Commands = function(root, stage, world, camera) {

    this.stage = stage;

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

    this.selection = null;

    this.root = null;

    this.indicators = [];
  };

  Commands.prototype.listenForEvents = function(stage, root) {
    var self = this;

    // Disable the context menu.
    GameState.renderer.view.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });

    //document.querySelector('body > canvas').addEventListener('mousedown', function(e) { console.log('native', e.button, e); }, false);

    stage.interactive = true;

    stage.mousemove = function(data) {
      var point = data.getLocalPosition(root);
      GameState.mouse = point;
      self.mouse = data.global;
    };

    stage.mousedown = function(data) {
      self.selection = null;
      self.mouseStart = data.global.clone();
      self.mouse = data.global;//data.getLocalPosition(root); //data.global;
      self.mouseDown = true;
    };

    stage.rightclick = function(data) {
      var point = data.getLocalPosition(root);
      self.issueCommand(point);
    }

    stage.mouseup = function(data) {
      self.mouseDown = false;
      self.mouse = data.global.clone();

      var start = root.toLocal(self.mouseStart);
      var end = root.toLocal(self.mouse);

      var x = Math.min(start.x, end.x);
      var y = Math.min(start.y, end.y);
      var width = Math.abs(end.x - start.x);
      var height = Math.abs(end.y - start.y);

      var items = self.world.findWithinRect(x, y, width, height);
      self.selection = new Selection(items);
    };
  };

  Commands.prototype.update = function() {
    this.iSpawn.updateOnly();

    if (this.selection) {
      this.selection.update();
    }

    if (this.mouseDown) {
      var start = this.mouseStart;
      var end = this.mouse;

      var g = GameState.overlay.fixed.graphics;
      g.lineStyle(2, 0x15FF00, 1);
      g.beginFill(0x000000, .3);
      g.drawRect(start.x, start.y, end.x - start.x, end.y - start.y);
    }

    this.indicators.forEach(util.invoke('update'));
    this.indicators = this.indicators.filter(util.invoke('isActive'));

    /*if (this.mouseDown) {
      this.iSpawn.trigger();
    }*/
  };

  Commands.prototype.issueCommand = function(point) {
    var selection = this.selection;
    if (!selection || !selection.items.length) {
      return;
    }

    selection.items.forEach(function(item) {
      item.target = point;
    });

    this.indicators.push(new Indicator(point));
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

