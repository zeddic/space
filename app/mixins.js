define(function() {

  var mixins = {};

  /**
   * Mixin physics methods onto a prototype.
   */
  mixins.physics = function(proto) {
    proto.$inits.push(function(data) {
      this.mass = data.mass || 1;
      this.velocity = data.velocity || new Vector();
    });

    // proto.updatePosition = function() {
    //   this.moveBy(this.velocity);
    // };

    proto.collide = function(other) {
      // To override.
    };

    proto.lookAtVelocity = function() {
     if (!this.velocity.isNull()) {
        this.rotation = this.velocity.rad();
      }
    };
  };

  return mixins;
});