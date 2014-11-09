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
  var renderer, stage, graphics;

  setupCanvas();

  var world = new World(state.stage);
  var commands = new Commands(stage, world);
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
    state.stage = new PIXI.DisplayObjectContainer();
    state.stage.interactive = true;
    stage.addChild(state.stage);

    //stage = state.stage = new PIXI.Stage();
    graphics = state.graphics = new PIXI.Graphics();
    state.stage.addChild(graphics);
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

    for (var i = 0; i < 50; i++) {
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

    // Update entities.
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
    randomize: reset
  };
};

function start() {
  space.game = createGame();
  space.game.start();
}
