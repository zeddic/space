define(function() {
  var TWO_PI = Math.PI * 2;

  var util = {};
  util.distance = {};

  util.distance.comparer = function(entity) {
    return util.distance.compare.bind(this, entity);
  };

  util.distance.compare = function(entity, a, b) {
    var dA = entity.position.distanceToSq(a.position);
    var dB = entity.position.distanceToSq(b.position);
    return dA - dB;
  };

  util.distance.within = function(point1, point2, range) {
    var dX = point1.x - point2.x;
    var dY = point1.y - point2.y;
    return (dX * dX + dY * dY) < (range * range);
  };

  util.distance.withinFn = function(point, range) {
    return function(otherPoint) {
      return util.distance.within(point, otherPoint, range);
    };
  };

  util.distance.withinRect = function(obj, x, y, width, height) {
    return (
        obj.left() < x + width &&
        obj.right() > x &&
        obj.top() < y + height &&
        obj.bottom() > y);
  };

  util.distance.withinRectFn = function(x, y, width, height) {
    return function(obj) {
      return util.distance.withinRect(obj, x, y, width, height);
    };
  };

  util.round = function(value, places) {
    var tens = 10 * places;
    return Math.floor(value * tens) / tens;
  };

  util.decimalToHexString = function(d) {
    var hex = Number(d).toString(16);
    hex = "000000".substr(0, 6 - hex.length) + hex; 
    return hex;
  };

  util.normalizeRad = function(rad) {
    return rad - TWO_PI * Math.floor((rad + Math.PI) / TWO_PI)
  };

  util.invoke = function(fnName) {
    return function(obj) {
      return obj[fnName]();
    }
  };

  util.negate = function(fn) {
    return function(o) {
      return !fn(o);
    }
  };

  return util;
});