
define(function(require) {

  var PIXI = require('lib/pixi');
  var Camera = require('camera');
  var Color = require('util/color');
  var Commands = require('commands');
  var GameState = require('game-state');
  var Stats = require('lib/stats.min');
  var World = require('world');
  var behaviors = require('behaviors');
  var random = require('util/random');

  PIXI.Point = Vector;

  function createGame() {
    var stats = setupStats();
    var renderer, stage;
    var stage, root;

    setupCanvas();

    var world = new World(root);
    var camera = new Camera(root);
    var commands = new Commands(root, stage, world, camera);

    setupShips();

    /**
     * Sets up WebGL stats plugin for FPS.
     */ 
    function setupStats() {
      var stats = new Stats();
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.bottom = '0px';
      stats.domElement.style.right = '0px';
      $(document.body).append(stats.domElement);
      return stats;
    }

    /**
     * Sets up the the webgl canvas and stage.
     */
    function setupCanvas() {
      renderer = GameState.renderer = new PIXI.WebGLRenderer(
          GameState.screen.width,
          GameState.screen.height);

      GameState.el.append(GameState.renderer.view);

      stage = new PIXI.Stage();
      root = new PIXI.DisplayObjectContainer();
      root.interactive = true;
      root.hitArea = new PIXI.Rectangle(0, 0, 1000, 1000);
      stage.addChild(root);
      graphics = new PIXI.Graphics();
      root.addChild(graphics);
    }

    function setupShips() {
      var width = GameState.screen.width * 5;
      var height = GameState.screen.height * 5;
      var edgeBuffer = 40;
      var planetBuffer = 50;
      var numPlanets = 10;

      var randomizePoint = function(point) {
        //point.x = rand(-width/2, width/2);
        //point.y = rand(-height/2, height/2);

        point.x = random.value(-1000, 1000);
        point.y = random.value(-1000, 1000);
      };

      for (var i = 0; i < 1; i++) {
        var ship = new Ship();
        ship.behavior = new behaviors.FlockBehavior(ship);
        ship.tint = Color.random();
        ship.rotation = random.value(0, Math.PI * 2);
        randomizePoint(ship.position);
        world.add(ship);
      };


      var big = new Ship();
      big.behavior = new behaviors.EatBehavior(big);
      big.tint = Color.RED;
      big.width = 60;
      big.height = 70;
      big.radius = 24;
      big.hunter = true;
      world.add(big);
    }

    /**
     * Creates a new world of planets.
     */
    function reset() {
      world.clearAll();
      setupShips();
    }

    /**
     * Primary game-loop called ~60fps.
     */
    function gameLoop() {
      graphics.clear();

      //console.log(root.getBounds());

      graphics.lineStyle(5, 0xFFFFFF, 1);
      graphics.moveTo(0, -50);
      graphics.lineTo(0, 50);

      graphics.moveTo(-50, 0)
      graphics.lineTo(50, 0);


      graphics.lineStyle(20, 0xFFFFFF, .4);
      graphics.drawCircle(0, 0, 1000);

      // Update entities.
      camera.update();
      world.update();
      commands.update();

      renderer.render(stage);

      requestAnimationFrame(gameLoop);
      stats.update();
    }

    /**
     * Destroys the game.
     */
    function dispose() {
      $(stats.domElement).remove();
      // TODO: dispose PIXI resources
    }

    return {
      dispose: dispose,
      start: function() {
        requestAnimationFrame(gameLoop);
      },
      randomize: reset,
      setSpawnColor: commands.setSpawnColor.bind(commands),
      setSpawnBehavior: commands.setSpawnBehavior.bind(commands),
      setSpawnRotation: commands.setSpawnRotation.bind(commands)
    };
  };

  return createGame;
});

