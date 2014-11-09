
/**
 * Detects and handles user input.
 */
Commands = function(stage, world) {

  this.world = world;

  /** @type {Vector} */
  this.mouse = null;

  this.mouseDown = false;

  this.listenForEvents(stage);
};

Commands.prototype.listenForEvents = function(stage) {
  var self = this;

  stage.mousemove = function(data) {
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
  if (this.mouseDown) {
    var ship = new Ship(this.mouse.x, this.mouse.y, space.colors.random());
    ship.target = this.mouse;
    this.world.add(ship);
  }
};
