define(function(require) {

  var GameState = require('game-state');
  var Interval = require('util/interval');
  var Ship = require('ship');
  var behaviors = require('behaviors');
  var Color = require('util/color');
  var Key = require('key');




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

    this.selection = [];
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
      self.mouseStart = data.global.clone();
      self.mouse = data.global;//data.getLocalPosition(root); //data.global;
      self.mouseDown = true;
    };

    stage.rightdown = function(data) {
      console.log('right down!');
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

      var ships = self.world.findWithinRect(x, y, width, height);

      var makeRed = function(ship) {
        ship.tint = Color.RED;
      }

      ships.forEach(makeRed);
    };

    stage.click = function(data) {
      console.log('click');
    }
  };

  Commands.prototype.update = function() {
    this.iSpawn.updateOnly();

    if (this.mouseDown) {
      var start = this.mouseStart;
      var end = this.mouse;

      var g = GameState.overlay.fixed.graphics;
      g.lineStyle(2, 0xFFFFFF, 1);
      //g.moveTo(start.x, start.y);
      //g.lineTo(end.x, end.y);


      g.beginFill(0xFF4F4F, .1);
      g.drawRect(start.x, start.y, end.x - start.x, end.y - start.y);

    }


    /*if (this.mouseDown) {
      this.iSpawn.trigger();
    }*/
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

