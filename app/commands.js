var global = {};
global.mouse = new Vector(0, 0);

/**
 * Detects and handles user input.
 */
Commands = function(stage, world) {

  this.world = world;

  /** @type {Vector} */
  this.mouse = null;

  this.mouseDown = false;

  this.listenForEvents(stage);

  this.iSpawn = new Interval(4).target(this.spawnShip, this);

  this.spawnColor = space.colors.RED;

  this.spawnBehavior = FlyAtTarget;

  this.spawnRotation = 0;
};

Commands.prototype.listenForEvents = function(stage) {
  var self = this;

  stage.mousemove = function(data) {
    global.mouse = data.global;
    self.mouse = data.global;
  };

  stage.mousedown = function(data) {
    self.mouse = data.global;
    self.mouseDown = true;
  };

  stage.mouseup = function(data) {
    self.mouseDown = false;
  };
};

Commands.prototype.update = function() {

  this.iSpawn.updateOnly();

  if (this.mouseDown) {
    this.iSpawn.trigger();
  }
};

Commands.prototype.setSpawnColor = function(color) {
  this.spawnColor = color;
};

Commands.prototype.setSpawnBehavior = function(behavior) {
  this.spawnBehavior = behavior;
};

Commands.prototype.setSpawnRotation = function(rotation) {
  this.spawnRotation = rotation;
};

Commands.prototype.spawnShip = function() {
  var ship = new Ship(this.mouse.x, this.mouse.y, this.spawnColor);
  ship.target = this.mouse;
  ship.rotation = this.spawnRotation;
  ship.behavior = new this.spawnBehavior(ship);
  this.world.add(ship);
};
