/**
 * Checks for collisions between entities.
 * @constructor
 */
CollisionSystem = function() {
  this.hash = new SpatialHash();
};

CollisionSystem.prototype.register = function(obj) {
  this.hash.put(obj);
};

CollisionSystem.prototype.unregister = function(obj) {
  this.hash.remove(obj);
};

CollisionSystem.prototype.clearAll = function() {
  this.hash = new SpatialHash();
};

CollisionSystem.prototype.move = function(obj, vector) {
  this.hash.remove(obj);
  obj.position.add(vector);
  this.hash.put(obj);
};

CollisionSystem.prototype.moveTo = function(obj, vector) {
  this.hash.remove(obj);
  obj.position.x = point.x;
  obj.position.y = point.y;
  this.hash.put(obj);
};

CollisionSystem.prototype.findWithinRadius = function(point, radius) {
  return this.hash.getInRadius(point, radius);
};

CollisionSystem.prototype.check = function(entities) {
  var list = entities.list;
  for (var i = 0, entity; entity = list[i]; i++) {
    this.checkEntity(entity);
  }
};

CollisionSystem.prototype.checkEntity = function(entity) {
  var entities = this.hash.get(entity);

  for (var i = 0, other; other = entities[i]; i++) {
    if (this.collides(entity, other)) {
      this.seperate(entity, other);
    }
  }
};

CollisionSystem.prototype.collides = function(o1, o2) {
  if (o1 === o2) {
    return false;
  }

  if (o2.dead || o1.dead) {
    return false;
  }

  if (o1.type == 'bullet' && o2.type == 'bullet') {
    return false;
  }

  return this.circleCollides(o1, o2);
};

CollisionSystem.prototype.circleCollides = function(o1, o2) {
  var dX = o1.position.x - o2.position.x;
  var dY = o1.position.y - o2.position.y;
  var radii = o1.radius + o2.radius;
  return (dX * dX + dY * dY) < (radii * radii);
};

CollisionSystem.prototype.squareCollides = function(o1, o2) {
  return (
      o1.left() < o2.right() &&
      o1.right() > o2.left() &&
      o1.top() < o2.bottom() &&
      o1.bottom() > o2.top());
};

CollisionSystem.prototype.seperate = (function() {
  var delta = new Vector();
  var offset1 = new Vector();
  var offset2 = new Vector();
  var DISPLACEMENT_BUFFER = .5;

  return function(o1, o2) {

    // Determine how far away the items are.
    var dX = o1.position.x - o2.position.x;
    var dY = o1.position.y - o2.position.y;

    if (dX == 0 && dY == 0) {
      dX = rand(-.5, .5);
      dY = rand(-.5, .5);
    }

    delta.set(dX, dY);

    // Determine how far away they SHOULD be to no longer collide.
    var minDistance = o1.radius + o2.radius + DISPLACEMENT_BUFFER;
    var displacement = minDistance - delta.length();

    // Determine how the displacement should be split between them.
    var o1InverseMass = 1 / o1.mass;
    var o2InverseMass = 1 / o2.mass;
    var totalInverseMass = o1InverseMass + o2InverseMass;
    var o1MassShare = o1InverseMass / totalInverseMass;
    var o2MassShare = o2InverseMass / totalInverseMass;

    // Determine the displacement vectors.
    offset1.set(delta.x, delta.y)
        .normalize()
        .multiplyScalar(displacement * o1MassShare);

    offset2.set(delta.x, delta.y)
        .invert()
        .normalize()
        .multiplyScalar(displacement * o2MassShare);

    // Update the items so they no longer collide.
    this.move(o1, offset1);
    this.move(o2, offset2);

    // Notify the objects.
    o1.collide && o1.collide(o2);
    o2.collide && o2.collide(o1);
  };
})();
