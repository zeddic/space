

/**
 * @param {PIXI.DisplayObjectContainer} root
 * @constructor
 */
Camera = function(root) {
  this.root = root;
  this.KEYBOARD_MOVE_SPEED = 5;
};

Camera.prototype.update = function() {

  return;

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
