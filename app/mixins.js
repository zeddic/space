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

    proto.updatePosition = function() {
      this.moveBy(this.velocity);
    };

    proto.collide = function(other) {
      // To override.
    };

    proto.lookAtVelocity = function() {

      //console.log('Velocity is: ' + this.velocity.x + ',' + this.velocity.y);
      if (!this.velocity.isNull()) {
        this.rotation = this.velocity.rad();
      }
      // + (Math.PI);
      //console.log('Resulting rotation is' + this.rotation);
    };
  };

  return mixins;
});