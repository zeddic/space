
/**
 * Keeps track of all currently active game entities.
 * @constructor
 */
Entities = function(container) {

  /** @type {PIXI.DisplayObjectContainer} */
  this.container = container;

  /**
   * Entities grouped by type.
   * @type {{string: Array.<Object>}}
   */
  this.all = {};

  /**
   * A flat list of all entities.
   * @type {Array.<Object>}
   */
  this.list = [];
};

Entities.prototype.fetch = function(type) {
  return this.all[type] || [];
};

Entities.prototype.add = function(item) {
  var type = this.getType(item);

  var sublist = this.all[type] || (this.all[type] = []);
  sublist.push(item);
  this.list.push(item);
  this.container.addChild(item);

  return item;
};

Entities.prototype.remove = function(item) {
  var type = this.getType(item);

  this.fetch(type).remove(item);
  this.list.remove(item);
  this.container.removeChild(item);
};

Entities.prototype.clearAll = function() {
  this.list = [];
  this.all = {};
  this.container.removeChildren();
};

Entities.prototype.getType = function(item) {
  return item.type || 'other';
};

Entities.prototype.createShip = function(x, y, tint) {
  return this.add(objects.createShip(x, y, tint));
};

Entities.prototype.createPlanet = function() {
  return this.add(objects.createPlanet());
};

Entities.prototype.createBullet = function() {
  return this.add(objects.createBullet());
};

Entities.prototype.updateAll = function() {
  for (var key in this.all) {
    var items = this.all[key];
    for (var i = items.length - 1, item; item = items[i]; i--) {
      item.update();
    }
  }
};

Entities.prototype.types = function() {
  return Object.keys(all);
};

Entities.prototype.ships = function() {
  return this.fetch('ship');
};

Entities.prototype.planets = function() {
  return this.fetch('planet');
};
