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

  var entities = state.entities = createEntities(stage);
  var planets = setupPlanets();
  var commands = createCommands(state, stage, entities);

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
    stage = state.stage = new PIXI.Stage();
    graphics = state.graphics = new PIXI.Graphics();
    stage.addChild(graphics);
  }

  /**
   * Sets up the starting planets.
   */
  function setupPlanets() {
    var planets = [];
    var width = state.width;
    var height = state.height;
    var edgeBuffer = 40;
    var planetBuffer = 50;
    var numPlanets = 10;

    var randomizePoint = function(point) {
      point.x = rand(edgeBuffer, width - edgeBuffer);
      point.y = rand(edgeBuffer, height - edgeBuffer);
    };

    var isCloseToOtherPlanet = function(planet) {
      return entities.planets().some(function(other) {
        var minDistance = planet.radius + other.radius;
        return space.util.withinRange(planet.position, other.position, minDistance)
      });
    };

    for (var i = 0; i < 10; i++) {
      var planet = objects.createPlanet();
      do {
        randomizePoint(planet.position);
      } while (isCloseToOtherPlanet(planet));

      entities.add(planet);
    };

    return planets;
  };

  /**
   * Creates a new world of planets.
   */
  function reset() {
    stage.removeChildren();
    entities = state.entities = createEntities(stage);
    planets = setupPlanets();
    commands = createCommands(state, stage, entities);
  }

  /**
   * Primary game-loop called ~60fps.
   */
  function gameLoop() {

    // Update entities.
    state.graphics.clear();
    //state.entities.forEach(invoke('update'));

    entities.updateAll();
    commands.update();
    space.collisions.check(entities);

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
