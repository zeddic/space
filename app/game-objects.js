var objects = {};

/**
 * Base prototype for all game objects.
 */
var BaseEntityProto = (function() {
  var proto = Object.create(PIXI.Sprite.prototype);

  proto.$inits = [];

  proto.$inits.push(function(data) {
    PIXI.Sprite.call(this, data.texture || this.texture);
    this.position.x = data.x || 0;
    this.position.y = data.y || 0;
    this.radius = data.radius || 5;
    this.tint = data.tint || this.tint;
    this.width = data.width || this.width;
    this.height = data.height || this.height;
    this.type = data.type || this.type;
  });

  proto.setup = function(data) {
    for (var i = 0, fn; fn = this.$inits[i]; i++) {
      fn.call(this, data);
    }
  };

  proto.left = function() {
    return this.position.x - this.width / 2;
  };

  proto.top = function() {
    return this.position.y - this.height / 2;
  };

  proto.right = function() {
    return this.position.x + this.width / 2;
  };

  proto.bottom = function() {
    return this.position.y + this.height / 2;
  };

  /**
   * Returns an x/y world point on the objects radius in the given vector
   * direction. If opt_offset is set, the point will be offset that
   * many world units from the radius.
   */
  proto.radiusPointByVector = function(vector, opt_offset) {
    var offset = opt_offset || 0;
    return vector.clone().
        normalize().
        multiplyScalar(this.radius + offset).
        add(this.position);
  };

  proto.radiusPointByTarget = function(target, opt_offset) {
    return this.radiusPointByVector(
        target.clone().sub(this.position),
        opt_offset);
  };

  proto.containsPoint = function(point) {
    return space.util.within(point, this);
  };

  proto.update = function() {
    // to override.
  };

  return proto;
})();


/**
 * Mixin physics methods onto a prototype.
 */
var mixinPhysics = function(proto) {
  proto.$inits.push(function(data) {
    this.mass = data.mass || 1;
    this.velocity = data.velocity || new Vector();
  });

  proto.updatePosition = function() {
    this.position.add(this.velocity);
  };

  proto.collide = function(other) {};

  proto.lookAtVelocity = function() {
    this.rotation = -this.velocity.rad() + (Math.PI / 2);
  };
};


/**
 * Creates a ship game object.
 */
objects.createShip = (function() {
  var proto = Object.create(BaseEntityProto);
  mixinPhysics(proto);
  proto.type = 'ship';
  proto.texture = PIXI.Texture.fromImage('textures/ship.png');

  /** Initialize */
  proto.init = function(x, y, tint) {
    this.setup({
      x: x,
      y: y,
      mass: 5,
      radius: 8,
      tint: tint,
      width: 20,
      height: 20
    });

    this.target = null;
    this.anchor.x = .4;
    this.anchor.y = .5;
    this.speed = 3;
    return this;
  };

  /** Update velocity to point to the current target. */
  proto.aim = function() {
    if(!this.target) {
      return;
    }

    var target = this.target;
    var dX = target.x - this.x;
    var dY = target.y - this.y;
    var distance = this.position.distanceTo(target);

    if (distance < this.waitDistance) {
      this.velocity.set(0, 0);
      return;
    }

    var scaler = Math.min(distance, this.speed);
    this.velocity.x = dX;
    this.velocity.y = dY;
    this.velocity.normalize();
    this.velocity.x *= scaler;
    this.velocity.y *= scaler;

    this.lookAtVelocity();
  }

  /** Handle collisions with planets. */
  proto.collide = function(other) {
    if (other.type == 'planet' && other.position == this.target) {
      var state = space.state;
      state.entities.remove(this);

      if (other.tint == this.tint) {
        other.population++;
      } else {
        other.population--;
        if (other.population <= 0) {
          other.population = 1;
          other.tint = this.tint;
        }
      }
    }
  };

  /** Update object. */
  proto.update = function() {
    this.aim();
    this.updatePosition();
  };

  return function(x, y, tint) {
    return Object.create(proto).init(x, y, tint);
  };
})();


/**
 * Creates a ship game object.
 */
objects.createPlanet = (function() {

  // Constants.
  var BASE_SIZE = 64;
  var BASE_RADIUS = 30;
  var BASE_GROWTH_RATE = 1.5;
  var BASE_MAX_POP = 50;
  var TEXT_STYLE = { fill: 'white' };

  // Base Proto.
  var proto = Object.create(BaseEntityProto);
  mixinPhysics(proto);
  proto.type = 'planet';
  proto.texture = PIXI.Texture.fromImage('textures/planet.png');

  /** Initialize */
  proto.init = function(x, y) {
    this.setup({
      x: x,
      y: y,
      radius: randInt(25, 65),
      tint: space.colors.random(),
      mass: 9999
    });

    this.anchor.x = .5;
    this.anchor.y = .5;

    var scale = this.radius / BASE_RADIUS;
    this.width = BASE_SIZE * scale;
    this.height = BASE_SIZE * scale;

    // Setup Population.
    this.popRate = BASE_GROWTH_RATE;
    this.popCounter = 0;
    this.maxPopulation = BASE_MAX_POP;
    this.interactive = true;
    this.population = 10;

    // Add Population Text.
    this.text = new PIXI.Text(this.population, TEXT_STYLE);
    this.text.anchor.x = .5;
    this.text.anchor.y = .5;
    this.addChild(this.text);

    return this;
  };

  /** Update object. */
  proto.update = function() {
    this.popCounter += this.popRate;
    if (this.popCounter > 100 && this.population < this.maxPopulation) {
      this.popCounter = 0;
      this.population++;
    }

    this.text.setText(this.population);
  };

  return function(x, y, tint) {
    return Object.create(proto).init(x, y, tint);
  };
})();
