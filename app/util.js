var space = space || {};
space.util = {};

var util = {};

// ================================
// EXTENSIONS
// ================================



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

function round(value, places) {
  var tens = 10 * places;
  return Math.floor(value * tens) / tens;
}

function decimalToHexString(d) {
  var hex = Number(d).toString(16);
  hex = "000000".substr(0, 6 - hex.length) + hex; 
  return hex;
}

var TWO_PI = Math.PI * 2;

function normalizeRad(rad) {
  return rad - TWO_PI * Math.floor((rad + Math.PI) / TWO_PI)
};


util.distance = {};

util.distance.comparer = function(entity) {
  return util.distance.compare.bind(this, entity);
};

util.distance.compare = function(entity, a, b) {
  var dA = entity.position.distanceToSq(a.position);
  var dB = entity.position.distanceToSq(b.position);
  return dA - dB;
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

