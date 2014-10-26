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

space.util.withinRange = function(point1, point2, range) {
  var dX = point1.x - point2.x;
  var dY = point1.y - point2.y;
  return (dX * dX + dY * dY) < (range * range);
};

space.util.within = function(point, entity) {
  return space.util.withinRange(point, entity.position, entity.radius);

  var dX = point.x - entity.x;
  var dY = point.y - entity.y;
  var radius = entity.radius;
  return (dX * dX + dY * dY) < (radius * radius);
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
