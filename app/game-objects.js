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
    this.side = this.tint;
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

  proto.radiusPointByRad = function(rad, opt_offset) {
    var vector = this.directionVector(rad);
    return this.radiusPointByVector(vector, opt_offset);
  };

  proto.directionVector = function(opt_rad, opt_length) {
    var rad = opt_rad || 0;
    return Vector.fromRad(rad + this.rotation, opt_length);
  };

  proto.containsPoint = function(point) {
    return space.util.within(point, this);
  };

  proto.update = function() {
    // to override.
  };

  proto.offscreen = function() {
    var state = space.state;
    var sWidth = state.width;
    var sHeight = state.height;

    return this.x + this.radius < 0 ||
        this.x - this.radius > sWidth ||
        this.y + this.radius < 0 ||
        this.y - this.radius > sHeight;
  }

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
 * SHIP
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
    this.counter = 0;

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
    //this.updatePosition();

    this.counter += .5;
    if (this.counter > 8) {
      this.counter = 0;
      this.fireBullet();
    }
  };

  proto.fireBullet = function() {
    var entities = space.state.entities;
    var bullet = entities.createBullet();

    bullet.side = this.tint;
    bullet.position = this.radiusPointByRad(0, 10);
    bullet.velocity = this.directionVector(0, 5);
  };

  return function(x, y, tint) {
    return Object.create(proto).init(x, y, tint);
  };
})();


/**
 * PLANET
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


/**
 * BULLET
 */
objects.createBullet = (function() {

  // Base Proto.
  var proto = Object.create(BaseEntityProto);
  mixinPhysics(proto);
  proto.type = 'bullet';
  proto.texture = PIXI.Texture.fromImage('textures/bullet.png');

  /** Initialize */
  proto.init = function(x, y) {
    this.setup({
      x: x,
      y: y,
      tint: space.colors.ORANGE,
      width: 2,
      height: 2,
      radius: 2
    });

    this.state = space.state;
    this.entities = space.state.entities;
    this.anchor.x = .5;
    this.anchor.y = .5;
    this.side = space.colors.ORANGE;
    return this;
  };

  /** Update object. */
  proto.update = function() {
    this.updatePosition();

    if (this.offscreen()) {
      this.entities.remove(this);
    }
  };

  proto.collide = function(other) {
    if (other.type == 'bullet') {
      return;
    }

    this.entities.remove(this);
  };

  return function(x, y) {
    return Object.create(proto).init(x, y);
  };
})();
