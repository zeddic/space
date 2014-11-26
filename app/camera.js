

/**
 * @param {PIXI.DisplayObjectContainer} root
 * @constructor
 */
Camera = function(root) {
  this.root = root;
  this.KEYBOARD_MOVE_SPEED = 5;

  this.setupEventListeners();
};

Camera.prototype.setupEventListeners = function() {
  var self = this;

  // Listen for mouse scroll events.
  window.addEventListener('wheel', function(e) {
    var deltaY = e.wheelDelta || e.detail;
    console.log(e);
    self.onWheelChange(e.clientX, e.clientY, deltaY);
    e.preventDefault();
  }, false);
};

Camera.prototype.onWheelChange = function(x, y, deltaY) {
  this.zoom(x, y, deltaY > 0)
};

Camera.prototype.update = function() {
  var zoomSpeed = .01;

  if (Key.isDown(Key.Q)) {
    this.zoomCenter(true);
  }

  if (Key.isDown(Key.Z)) {
    this.zoomCenter(false);
  }

  var moveSpeed = this.KEYBOARD_MOVE_SPEED;

  if (Key.isDown(Key.UP) || Key.isDown(Key.W)) {
    this.root.position.y += moveSpeed;
  }

  if (Key.isDown(Key.DOWN) || Key.isDown(Key.S)) {
    this.root.position.y -= moveSpeed;
  }

  if (Key.isDown(Key.LEFT) || Key.isDown(Key.A)) {
    this.root.position.x += moveSpeed;
  }

  if (Key.isDown(Key.RIGHT) || Key.isDown(Key.D)) {
    this.root.position.x -= moveSpeed;
  }
};

Camera.prototype.zoomCenter = function(isZoomIn) {
  var state = space.state;
  var width = state.width;
  var height = state.height;
  this.zoom(width/2, height/2, isZoomIn);
};

Camera.prototype.zoom = function(x, y, isZoomIn) {
  var root = this.root;
  var direction = isZoomIn ? 1 : -1;
  var factor = (1 + direction * 0.01);


  var beforeTransform = this.toLocal(x, y);
  root.scale.x *= factor;
  root.scale.y *= factor;
  var afterTransform = this.toLocal(x, y);

  root.position.x += (afterTransform.x - beforeTransform.x) * root.scale.x;
  root.position.y += (afterTransform.y - beforeTransform.y) * root.scale.y;
  root.updateTransform();
};

Camera.prototype.toLocal = (function() {
  var temp = new Vector(0, 0);
  return function(x, y) {
    return this.root.toLocal(temp.set(x, y));
  };
}()); 
