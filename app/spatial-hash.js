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
    var point = obj.position;
    var keys = this.getKeysByRadius_(point.x, point.y, obj.radius);
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
   * as the object (including itself).
   */
  SpatialHash.prototype.get = function(obj) {
    return this.getInRange(obj.position, obj.radius);
  };

  /**
   * Updates an objects location in the hash based on it's current location.
   * This should be called after any update to the objects position.
   */
  SpatialHash.prototype.update = function(obj) {
    var point = obj.position;
    var beforeHash = obj.$spatialHash || '';
    var currentKeys = this.getKeysByRadius_(point.x, point.y, obj.radius);
    var currentHash = this.hashKeys_(currentKeys);

    if (currentHash == beforeHash) {
      return;
    }

    this.remove(obj);
    this.put(obj);
  };

  /**
   * Returns all objects that fall in buckets that are within range of a point.
   */
  SpatialHash.prototype.getInRange = function(point, range) {
    var keys = this.getKeysByRadius_(point.x, point.y, range);
    return this.keysToItems_(keys);
  };

  /**
   * Returns all objects that fall in buckets within the given rectangle.
   */
  SpatialHash.prototype.getInRect = function(x, y, width, height) {
    var isInRect = util.distance.withinRectFn(x, y, width, height);
    var keys = this.getKeysByRect_(x, y, width, height);
    return this.keysToItems_(keys).filter(isInRect);
  };


  /**
   * Returns all objects that are within the given radius of the given point.
   */
  SpatialHash.prototype.getInRadius = function(point, radius) {
    // TODO(scott): This is really narrow phase detection. It should
    // be moved up and out of the class.
    var isInRadius = util.distance.withinFn(point, radius);
    return this.getInRange(point, radius).filter(isInRadius);
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
   * Converts a list of keys to a list of objects identified by those keys.
   * @return {Array.<Object>}
   */
  SpatialHash.prototype.keysToItems_ = function(keys) {
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
   * Gets all keys for bukets in a circle.
   */
  SpatialHash.prototype.getKeysByRadius_ = function(x, y, radius) {
    return this.getKeysByRect_(x - radius, y - radius, radius * 2, radius * 2);
  };

  /**
   * Gets all keys for buckets in a rectangle.
   */
  SpatialHash.prototype.getKeysByRect_ = function(oX, oY, width, height) {
    var sX = (oX) >> POWER_OF_TWO;
    var sY = (oY) >> POWER_OF_TWO;
    var eX = (oX + width) >> POWER_OF_TWO;
    var eY = (oY + height) >> POWER_OF_TWO;

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
