PIXI.Point = Vector;

function createState() {
  var el = $('.game-content');

  var state = {
    el:  el,
    width: el.innerWidth(),
    height: el.innerHeight(),
    graphics: null,
    renderer: null,
    stage: null,
    entities: []
  };

  $(window).resize(function() {
    state.width = el.innerWidth();
    state.height = el.innerHeight();
    state.renderer && state.renderer.resize(state.width, state.height);
  });

  return state;
}

space.state = {};
space.game = {};

function createGame() {
  var stats = setupStats();
  var state = space.state = createState();
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
    renderer = state.renderer = new PIXI.WebGLRenderer(state.width, state.height);
    state.el.append(state.renderer.view);

    stage = new PIXI.Stage();
    root = new PIXI.DisplayObjectContainer();
    root.interactive = true;
    root.hitArea = new PIXI.Rectangle(0, 0, 1000, 1000);
    stage.addChild(root);
    graphics = new PIXI.Graphics();
    root.addChild(graphics);
  }

  function setupShips() {
    var width = state.width;
    var height = state.height;
    var edgeBuffer = 40;
    var planetBuffer = 50;
    var numPlanets = 10;

    var randomizePoint = function(point) {
      point.x = rand(edgeBuffer, width - edgeBuffer);
      point.y = rand(edgeBuffer, height - edgeBuffer);
    };

    for (var i = 0; i < 0; i++) {
      var ship = new Ship();
      ship.tint = space.colors.random();
      ship.rotation = rand(0, Math.PI * 2);
      randomizePoint(ship.position);
      world.add(ship);
    };
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

      graphics.lineStyle(12, 0xFFFFFF, 1);
    graphics.moveTo(450, 450);
    graphics.lineTo(550, 550);

    graphics.moveTo(550, 450)
    graphics.lineTo(450, 550);

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

function start() {
  space.game = createGame();
  space.game.start();
}
