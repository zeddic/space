
var space = space || {};

space.collisions = function() {

  function check(entities) {
    for (var i = 0, entity; entity = entities[i]; i++) {
      checkEntity(entities, entity);
    }
  }

  function checkEntity(entities, entity) {
    for (var i = 0, other; other = entities[i]; i++) {
      if (collides(entity, other)) {
        seperate(entity, other);
      }
    }
  }

  function collides(o1, o2) {
    return o1 !== o2  && circleCollides(o1, o2);
  }

  function circleCollides(o1, o2) {
    var dX = o1.position.x - o2.position.x;
    var dY = o1.position.y - o2.position.y;
    var radii = o1.radius + o2.radius;

    return (dX * dX + dY * dY) < (radii * radii);
  }

  function squareCollides(o1, o2) {
    return (
        o1.left() < o2.right() &&
        o1.right() > o2.left() &&
        o1.top() < o2.bottom() &&
        o1.bottom() > o2.top());
  }

  var delta = new Vector();
  var offset1 = new Vector();
  var offset2 = new Vector();

  function seperate(o1, o2) {

    // Determine how far away the items are.
    var dX = o1.position.x - o2.position.x;
    var dY = o1.position.y - o2.position.y;
    delta.set(dX, dY);

    // Determine how far away they SHOULD be to no longer collide.
    var minDistance = o1.radius + o2.radius;
    var displacement = minDistance - delta.length();

    // Split this displacement between the two items.
    // TODO(baileys): Split this proportionally based on Mass*Velocity. Project the
    // velocity vectors of both items onto the delta vector to figure out
    // how fast they were going in that direction.
    var o1InverseMass = 1 / o1.mass;
    var o2InverseMass = 1 / o2.mass;
    var totalInverseMass = o1InverseMass + o2InverseMass;

    var o1MassShare = o1InverseMass / totalInverseMass;
    var o2MassShare = o2InverseMass / totalInverseMass;

    var o1Speed = o1.velocity.dot(delta);
    var o2Speed = o2.velocity.dot(delta);
    var totalSpeed = o1Speed + o2Speed;
    var o1SpeedShare = o1Speed / totalSpeed;
    var o2SpeedShare = o2Speed / totalSpeed;


    //var o1Share = (o1Speed * o1InverseMass) / (o1Speed * o1InverseMass + o2Speed * o2InverseMass);
    //var o2Share = (o2Speed * o2InverseMass) / (o1Speed * o1InverseMass + o2Speed * o2InverseMass);

    var o1Share = o1MassShare * o1SpeedShare;
    var o2Share = o2MassShare * o2SpeedShare;

    var object1Displacement = displacement * o1MassShare;
    var object2Displacement = displacement * o2MassShare;

    offset1.set(delta.x, delta.y)
        .normalize()
        .multiplyScalar(object1Displacement)
        .addTo(o1.position);

    offset2.set(delta.x, delta.y)
        .invert()
        .normalize()
        .multiplyScalar(object2Displacement)
        .addTo(o2.position);

    o1.collide && o1.collide(o2);
    o2.collide && o2.collide(o1);
  }

  return {
    check: check
  };

}();
