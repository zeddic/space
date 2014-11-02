var space = space || {};
space.util = {};


function invoke(fnName) {
  return function(item) {
    item[fnName](item);
    // fn.call(item);
  }
}

function rand(min, max) { 
  return Math.random()*(max-min) + min; 
}

function randInt(min, max) {
  return Math.floor(Math.random()*(max-min) + min); 
}

Array.prototype.remove = function(item) {
  var index = this.indexOf(item);
  if (index !== -1) {
    this.splice(index, 1);
  }
};

Array.prototype.contains = function(item) {
  return this.indexOf(item) !== -1;
};

space.util.withinDistance = function(point1, point2, range) {
  var dX = point1.x - point2.x;
  var dY = point1.y - point2.y;
  return (dX * dX + dY * dY) < (range * range);
};

space.util.within = function(point, entity) {
  return space.util.withinDistance(point, entity.position, entity.radius);
};

space.colors = function() {
  var RED = 0xF90101;
  var BLUE = 0x0266C8;
  var WHITE = 0xFFFFFF;
  var GREEN = 0x00933B;
  var ORANGE = 0xF2B50F;
  var colors = [RED, BLUE, WHITE, GREEN, ORANGE];

  return {
    random: function() {
      var color = colors[randInt(0, colors.length)];
      return color;
    },
    colors: colors,
    RED: RED,
    BLUE: BLUE,
    WHITE: WHITE,
    GREEN: GREEN,
    ORANGE: ORANGE
  };
}();


function createEntities(stage) {
  var all = {};
  var list = [];

  function fetch(type) {
    return all[type] || [];
  }

  function add(item, opt_type) {
    var type = getType(item, opt_type);
    if (!all[type]) {
      all[type] = [];
    }
    all[type].push(item);
    list.push(item);
    stage.addChild(item);
    space.collisions.register(item);

    return item;
  }

  function remove(item, opt_type) {
    var type = getType(item, opt_type);
    var items = fetch(type);
    var index = items.indexOf(item);
    if (index !== -1) {
      items.splice(index, 1);
    }

    index = list.indexOf(item);
    if (index !== -1) {
      list.splice(index, 1);
      stage.removeChild(item);
    }

    space.collisions.unregister(item);
  }

  function getType(item, opt_type) {
    return opt_type || item.type || 'other';
  }

  function createShip(x, y, tint) {
    return add(objects.createShip(x, y, tint));
  }

  function createPlanet() {
    return add(objects.createPlanet());
  }

  function createBullet() {
    return add(objects.createBullet());
  }

  function updateAll() {
    for (var key in all) {
      var items = all[key];
      for (var i = 0, item; item = items[i]; i++) {
        item.update();
      }
    }
  }

  function types() {
    return Object.keys(all);
  }

  return {
    ships: fetch.bind(this, 'ship'),
    planets: fetch.bind(this, 'planet'),
    add: add,
    remove: remove,
    createShip: createShip,
    createPlanet: createPlanet,
    createBullet: createBullet,
    updateAll: updateAll,
    types: types,
    list: list,
    fetch: fetch
  };
};
