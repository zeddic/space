
/**
 * @constructor
 */
function World(stage) {

  /** All game objects in the world. */
  this.entities = new Entities(stage);

  /** Reolves collisions among game objects. */
  this.collisions = new CollisionSystem();
};


World.prototype.update = function() {
  this.entities.updateAll();
  this.collisions.check(this.entities);
};


World.prototype.add = function(obj) {
  obj.world = this;
  this.entities.add(obj);
  this.collisions.register(obj);
};


World.prototype.remove = function(obj) {
  obj.world = null;
  this.entities.remove(obj);
  this.collisions.unregister(obj);
};


World.prototype.clearAll = function() {
  this.entities.clearAll();
  this.collisions.clearAll();
};

/**
 *
 */
World.prototype.moveBy = function(obj, vector) {
  this.collisions.move(obj, vector);
};


/**
 *
 */
World.prototype.moveTo = function(obj, vector) {
  this.collisions.moveTo(obj, vector);
};

World.prototype.isOffscreen = function(obj) {
  var state = space.state;
  var sWidth = state.width;
  var sHeight = state.height;

  return obj.x + obj.radius < 0 ||
      obj.x - obj.radius > sWidth ||
      obj.y + obj.radius < 0 ||
      obj.y - obj.radius > sHeight;
}