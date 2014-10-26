function createCommands(stage, planets) {

  var state = space.state;
  var stage = state.stage;
  var graphics = state.graphics;
  var entities = state.entities;
  var startPlanet = null;
  var mousePoint = null;

  stage.mousemove = function(data) {
    mousePoint = data.global.clone();
  }

  stage.mouseup = function(data) {
    var planet = findTargetPlanet(data.global);
    if (planet) {
      onPlanetEnd(planet);
    }
    startPlanet = null;
  };

  planets.forEach(function(planet) {
    planet.mousedown = onPlanetStart;
  });

  function findTargetPlanet(point) {
    for (var i = 0, planet; planet = planets[i]; i++) {
      if (planet.contains(point)) {
        return planet;
      }
    }

    return null;
  };

  function onPlanetStart(data) {
    startPlanet = data.target;
  }

  function onPlanetEnd(planet) {
    if (startPlanet) {
      issueCommand(startPlanet, planet);
    }
  }

  function issueCommand(start, end) {
    // Ignore commands to the same planet.
    if (start == end) {
      return;
    }

    var numShips = Math.ceil(start.population * .75);
    if (start.population - 1 <= 0) {
      numShips--;
    }

    start.population -= numShips;

    //var numShips = Math.floor(start.getScale() * 50);

    for (var i = 0; i < numShips; i++) {
      var ship = new Ship(start.x, start.y, start.tint);
      ship.target = end.position;
      entities.push(ship);
      stage.addChild(ship);
    }
  };

  function randomPlanet() {
    return planets[randInt(0, planets.length)];
  }

  function update() {

    // Randomly issue commands for demo.
    var automattedCommand = (randInt(0, 100) === 1);
    if (automattedCommand) {
      issueCommand(randomPlanet(), randomPlanet());
    }

    // Draw a line from the start planet to the users mouse.
    if (startPlanet && mousePoint) {
      if (startPlanet.contains(mousePoint)) {
        return;
      }

      var startPoint = startPlanet.getEdgePoint(mousePoint, 5);

      graphics.lineStyle(5, 0xFFFFFF);
      graphics.moveTo(startPoint.x, startPoint.y);
      graphics.lineTo(mousePoint.x, mousePoint.y);
    }
  }

  return {
    update: update
  };
}