var space = space || {};
space.util = {};


// ================================
// EXTENSIONS
// ================================

Array.prototype.remove = function(item) {
  var index = this.indexOf(item);
  if (index !== -1) {
    this.splice(index, 1);
  }
};

Array.prototype.contains = function(item) {
  return this.indexOf(item) !== -1;
};

// ================================
// UTILITY METHODS
// ================================

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

var TWO_PI = Math.PI * 2;

function normalizeRad(rad) {
  return rad - TWO_PI * Math.floor((rad + Math.PI) / TWO_PI)
};

space.util.withinDistance = function(point1, point2, range) {
  var dX = point1.x - point2.x;
  var dY = point1.y - point2.y;
  return (dX * dX + dY * dY) < (range * range);
};

space.util.within = function(point, entity) {
  return space.util.withinDistance(point, entity.position, entity.radius);
};


// ================================
// COLORS
// ================================


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

