define(function(require) {

  var util = require('util/util');
  var POWER_OF_TWO = 6;

  function SpatialHash() {
    this.hash = {};
  }

  /**
   * Puts an object in the spaital hash. The object will be
   * registered based on the bounds determined by its {@code radius}
   * and x/y position.
   *
   * Registered objects with get an extra property {@code $spatialHash}
   * added to them which contained their encoded location.
   */
  SpatialHash.prototype.put = function(obj) {
    var keys = this.getKeys_(obj.position, obj.radius);
    for (var i = 0, key; key = keys[i]; i++) {
      var list = this.hash[key] || (this.hash[key] = []);
      list.push(obj);
    }
    obj.$spatialHash = this.hashKeys_(keys);
  };

  /**
   * Removes a previously registered object.
   */
  SpatialHash.prototype.remove = function(obj) {
    var keys = this.unhashKeys_(obj.$spatialHash || '');
    for (var i = 0, key; key = keys[i]; i++) {
      var list = this.hash[key];
      list && list.remove(obj);
    }
  };

  /**
   * Returns all objects that exist in the same spaital hash location
   * has the object (including itself).
   */
  SpatialHash.prototype.get = function(obj) {
    return this.getInRange(obj.position, obj.radius);
  };

  /**
   * Updates an objects location in the hash based on it's current location.
   * This should be called after any update to the objects position.
   */
  SpatialHash.prototype.update = function(obj) {
    var beforeHash = obj.$spatialHash || '';
    var currentKeys = this.getKeys_(obj.position, obj.radius);
    var currentHash = this.hashKeys_(currentKeys);

    if (currentHash == beforeHash) {
      return;
    }

    this.remove(obj);
    this.put(obj);
  };

  /**
   * Returns all objects in the given square bounds.
   */
  SpatialHash.prototype.getInRange = function(point, range) {
    var keys = this.getKeys_(point, range);
    var result = [];
    for (var i = 0, key; key = keys[i]; i++) {
      var list = this.hash[key];
      if (list) {
        result = result.concat(this.hash[key]);
      }
    }
    return result;
  };

  /**
   * Returns all objects that are within the given radius of the given point.
   */
  SpatialHash.prototype.getInRadius = function(point, radius) {
    var items = this.getInRange(point, radius);
    for (var i = items.length - 1, item; item = items[i]; i--) {
      if(!util.withinDistance(point, item.position, radius)) {
        items.splice(i, 1);
      };
    }
    return items;
  };

  /**
   * Returns keys for all locations in the hash that a given point & radius cover.
   */
  SpatialHash.prototype.getKeys_ = function(point, range) {
    var oX = point.x;
    var oY = point.y;

    var sX = (oX - range) >> POWER_OF_TWO;
    var sY = (oY - range) >> POWER_OF_TWO;
    var eX = (oX + range) >> POWER_OF_TWO;
    var eY = (oY + range) >> POWER_OF_TWO;

    var keys = [];
    for (var y = sY; y <= eY; y++) {
      for(var x = sX; x <= eX; x++) {
        keys.push(x + ':' + y);
      }
    }

    return keys;
  };

  /**
   * Encodes a series of keys into a string.
   */
  SpatialHash.prototype.hashKeys_ = function(keys) {
    return keys.join(';');
  };

  /**
   * Decodes a string into a series of keys.
   */
  SpatialHash.prototype.unhashKeys_ = function(hash) {
    return hash.split(';');
  }

  return SpatialHash;
});
