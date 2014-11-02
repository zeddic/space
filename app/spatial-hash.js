(function(w) {
  'use strict';
  
  var POWER_OF_TWO = 5;

  function SpatialHash() {
    this.hash = {};
  }

  SpatialHash.prototype.getKeys = function(point, range) {
    var oX = point.x;
    var oY = point.y;

    var sX = (oX - range) >> POWER_OF_TWO;
    var sY = (oY - range) >> POWER_OF_TWO;
    var eX = (oX + range) >> POWER_OF_TWO;
    var eY = (oY + range) >> POWER_OF_TWO;
    var keys = [];

    for (var y = sY; y <= eY; y++) {
      for(var x = sX; x <= eX; x++) {
        keys.push('' + x + ':' + y);
      }
    }

    return keys;
  };

  SpatialHash.prototype.remove = function(obj) {
    var keys = this.getKeys(obj.position, obj.radius);
    for (var i = 0, key; key = keys[i]; i++) {
      var list = this.hash[key];
      list && list.remove(obj);
    }
  };

  SpatialHash.prototype.put = function(obj) {
    var keys = this.getKeys(obj.position, obj.radius);
    for (var i = 0, key; key = keys[i]; i++) {
      var list = this.hash[key] || (this.hash[key] = []);
      list.push(obj);
    }
  };

  SpatialHash.prototype.get = function(obj) {
    return this.getInRange(obj.position, obj.radius);
  };

  SpatialHash.prototype.getInRange = function(point, range) {
    var keys = this.getKeys(point, range);
    var items = [];
    for (var i = 0, key; key = keys[i]; i++) {
      var list = this.hash[key];
      if (list) {
        items = items.concat(this.hash[key]);
      }
    }
    return items;
  };

  SpatialHash.prototype.getInRadius = function(point, radius) {
    var items = this.getInRange(point, radius);
    for (var i = items.length - 1, item; item = items[i]; i--) {
      if(!space.util.withinDistance(point, item.position, radius)) {
        items.splice(i, 1);
      };
    }
    return items;
  };

  w.SpatialHash = SpatialHash;
})(this);
