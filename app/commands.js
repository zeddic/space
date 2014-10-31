function createCommands(state, stage, entities) {

  var stage = state.stage;
  var graphics = state.graphics;
  var startPlanet = null;
  var mousePoint = null;
  var planets = entities.planets();
  var down = false;
  var globalMousePoint;

  planets.forEach(function(planet) {
    planet.mousedown = onPlanetStart;
  });

  stage.mousemove = function(data) {
    mousePoint = data.global.clone();
    globalMousePoint = data.global;
  }

  stage.mousedown = function(data) {
    down = true;
          var ship = entities.createShip(mousePoint.x, mousePoint.y, space.colors.random());
      ship.target = globalMousePoint;
  }

  stage.mouseup = function(data) {
    down = false;
    var planet = findTargetPlanet(data.global);
    if (planet) {
      onPlanetEnd(planet);
    }
    startPlanet = null;
  };

  function findTargetPlanet(point) {
    for (var i = 0, planet; planet = planets[i]; i++) {
      if (planet.containsPoint(point)) {
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
      //issueCommand(startPlanet, planet);
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

    for (var i = 0; i < numShips; i++) {
      var ship = entities.createShip(start.x, start.y, start.tint);
      ship.target = end.position;
    }
  };

  function randomPlanet() {
    return planets[randInt(0, planets.length)];
  }

  function update() {
    if (down) {
      // var ship = entities.createShip(mousePoint.x, mousePoint.y, space.colors.random());
      // ship.target = globalMousePoint;
    }

    // Randomly issue commands for demo.
    // var automattedCommand = (randInt(0, 100) === 1);
    // if (automattedCommand) {
    //   issueCommand(randomPlanet(), randomPlanet());
    // }

    // Draw a line from the start planet to the users mouse.
    // if (startPlanet && mousePoint) {
    //   if (startPlanet.containsPoint(mousePoint)) {
    //     return;
    //   }

    //   var startPoint = startPlanet.radiusPointByTarget(mousePoint, 5);

    //   graphics.lineStyle(5, 0xFFFFFF);
    //   graphics.moveTo(startPoint.x, startPoint.y);
    //   graphics.lineTo(mousePoint.x, mousePoint.y);
    // }
  }

  return {
    update: update
  };
}