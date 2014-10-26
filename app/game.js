var renderer, camera, stage;

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

function start() {

  // Stats
  var stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.bottom = '0px';
  stats.domElement.style.right = '0px';
  $(document.body).append(stats.domElement);

  // Canvas
  var state = space.state = createState();
  var width = state.width;
  var height = state.height;
  var renderer = state.renderer = new PIXI.WebGLRenderer(width, height);
  state.el.append(state.renderer.view);

  var stage = state.stage = new PIXI.Stage();
  var items = state.entities;
  var planets = [];
  var ships = [];

  // Create Planets.
  var edgeBuffer = 40;
  var planetBuffer = 50;
  for (var i = 0; i < 10; i++) {
    var planet = new Planet();
    planet.position = randomPlanetPosition();

    while(isCloseToExistingPlanet(planet)) {
      planet.position = randomPlanetPosition();
    }

    planets.push(planet);
    items.push(planet);
  }

  function randomPlanetPosition() {
    return new Vector(
        rand(edgeBuffer, width - edgeBuffer),
        rand(edgeBuffer, height - edgeBuffer));
  }

  function isCloseToExistingPlanet(planet) {
    for (var i = 0, other; other = planets[i]; i++) {
      var minDistance = planet.radius + other.radius;
      if (space.util.withinRange(planet.position, other.position, minDistance)) {
        return true;
      }
    }
    return false;
  };

  // Create Ships.
  for (var i = 0; i < 0; i++) {
    var ship = new Ship(rand(0, width), rand(0, height));
    items.push(ship);
    ships.push(ship);
  }

  // Create Graphics.
  state.graphics = new PIXI.Graphics();

  // Move them around when you click.
  /*stage.click = function() {
    items.forEach(function(item) {
      item.position.set(rand(0, width), rand(0, height));
    });
  }; */

  // Have ships follow your mouse.
  stage.mousemove = function(data) {
    ships.forEach(function(ship) {
      ship.target = data.global;
    });
  };

  var commands = createCommands(stage, planets);

  items.forEach(stage.addChild.bind(stage));
  stage.addChild(state.graphics);

  function animate() {
    state.graphics.clear();

    items.forEach(invoke('update'));
    commands.update();
    space.collisions.check(items);

    renderer.render(stage);

    requestAnimationFrame(animate);
    stats.update();
  }

  requestAnimationFrame(animate);
}
