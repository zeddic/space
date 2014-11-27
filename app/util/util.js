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

  util.withinDistance = function(point1, point2, range) {
    var dX = point1.x - point2.x;
    var dY = point1.y - point2.y;
    return (dX * dX + dY * dY) < (range * range);
  };

  util.within = function(point, entity) {
    return space.util.withinDistance(point, entity.position, entity.radius);
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
  return util;
});