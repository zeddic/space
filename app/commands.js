var global = {};
global.mouse = new Vector(0, 0);

/**
 * Detects and handles user input.
 */
Commands = function(root, stage, world, camera) {

  this.camera = camera;

  this.world = world;

  /** @type {Vector} */
  this.mouse = null;

  this.mouseDown = false;

  this.listenForEvents(stage, root);

  this.iSpawn = new Interval(4).target(this.spawnShip, this);

  this.spawnColor = space.colors.RED;

  this.spawnBehavior = FlyAtTarget;

  this.spawnRotation = 0;


  //root.mousemove = function(data) {
  //  console.log('here!');
  //}
};

Commands.prototype.listenForEvents = function(stage, root) {
  var self = this;

  stage.mousemove = function(data) {
    //console.log('here');

    var point = data.getLocalPosition(root);

    global.mouse = point;// data.global;
    self.mouse = point;//data.global;
  };

  stage.mousedown = function(data) {
    self.mouse = data.getLocalPosition(root); //data.global;
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
