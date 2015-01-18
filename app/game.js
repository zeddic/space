
define(function(require) {

  var PIXI = require('lib/pixi');
  var Camera = require('camera');
  var Color = require('util/color');
  var Commands = require('commands');
  var GameState = require('game-state');
  var Planet = require('planet');
  var Stats = require('lib/stats.min');
  var Tail = require('tail');
  var World = require('world');
  var behaviors = require('behaviors');
  var random = require('util/random');
  var PlayerControl = require('player-control');

  PIXI.Point = Vector;

  function createGame() {
    var stats = setupStats();
    var renderer, stage, graphics;
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
      renderer = GameState.renderer = new PIXI.autoDetectRenderer(
          GameState.screen.width,
          GameState.screen.height);

      GameState.el.append(GameState.renderer.view);

      stage = new PIXI.Stage();

      // Setup Fixed Background Layer
      GameState.background.fixed.container = new PIXI.DisplayObjectContainer();
      GameState.background.fixed.graphics = new PIXI.Graphics();
      GameState.background.fixed.container.addChild(
          GameState.background.fixed.graphics);
      stage.addChild(GameState.background.fixed.container);

      // Setup Foreground Layer
      root = new PIXI.DisplayObjectContainer();
      root.interactive = true;
      root.hitArea = new PIXI.Rectangle(0, 0, 1000, 1000);
      stage.addChild(root);

      // Foreground Graphics
      graphics = new PIXI.Graphics();
      root.addChild(graphics);
      GameState.root = root;
      GameState.graphics = graphics;

      // Overlay layer
      GameState.overlay.fixed.container = new PIXI.DisplayObjectContainer();
      GameState.overlay.fixed.graphics = new PIXI.Graphics();
      GameState.overlay.fixed.container.addChild(
          GameState.overlay.fixed.graphics);
      stage.addChild(GameState.overlay.fixed.container);
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

      for (var i = 0; i < 0; i++) {
        var ship = new Ship();
        randomizePoint(ship.position);
        ship.behavior = new behaviors.WanderBehavior(ship);
        //ship.tail = new Tail(ship);
        ship.tint = Color.random();
        ship.rotation = random.value(0, Math.PI * 2);
        world.add(ship);
      };

      var player = new Ship();
      player.tail = new Tail(player);
      player.control = new PlayerControl(player);
      player.position.x = 100;
      GameState.player = player;
      world.add(player);

      // var big = new Ship();
      // big.behavior = new behaviors.EatBehavior(big);
      // big.tint = Color.RED;
      // big.width = 60;
      // big.height = 70;
      // big.radius = 24;
      // big.hunter = true;
      // world.add(big);

      var planet = new Planet(0, 0);
      world.add(planet);

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
      GameState.background.fixed.graphics.clear();
      GameState.overlay.fixed.graphics.clear();
      graphics.clear();


      // graphics.lineStyle(5, 0xFFFFFF, 1);
      // graphics.moveTo(0, -50);
      // graphics.lineTo(0, 50);

      // graphics.moveTo(-50, 0)
      // graphics.lineTo(50, 0);


      // graphics.lineStyle(20, 0xFFFFFF, .4);
      // graphics.drawCircle(0, 0, 1000);

      // Update entities.
      camera.update();

      camera.centerOn(GameState.player);

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

