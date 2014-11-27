define(function(require) {

  var GameState = require('game-state');
  var Key = require('key');
  var Vector = require('vector');

  /**
   * 
   * @param {PIXI.DisplayObjectContainer} root
   * @constructor
   */
  Camera = function(root) {

    /** The container to pan/zoom around. */
    this.root = root;

    /** How many units to move the camera per frame when panning. */
    this.KEYBOARD_MOVE_SPEED = 5;

    /** How fast to scale zoom when using the keyboard zoom keys. */
    this.KEYBOARD_ZOOM_SPEED = .02;

    /** Scales the mouse wheel deltaY by this value when scaling zoom. */
    this.WHEEL_ZOOM_SCALAR = .0001;

    this.setupEventListeners();
  };

  Camera.prototype.setupEventListeners = function() {
    var self = this;

    // Listen for mouse scroll events.
    window.addEventListener('wheel', function(e) {
      var deltaY = e.wheelDeltaY || e.detail;
      self.onWheelChange(e.clientX, e.clientY, deltaY);
      e.preventDefault();
    }, false);
  };

  Camera.prototype.onWheelChange = function(x, y, deltaY) {
    var amount = Math.abs(deltaY) * this.WHEEL_ZOOM_SCALAR;
    this.zoom(x, y, deltaY > 0, amount);
  };

  Camera.prototype.update = function() {
    // Keyboard Zoom In/Out
    if (Key.isDown(Key.Q)) {
      this.zoomCenter(true, this.KEYBOARD_ZOOM_SPEED);
    }

    if (Key.isDown(Key.Z)) {
      this.zoomCenter(false, this.KEYBOARD_ZOOM_SPEED);
    }

    // Keyboard Panning
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

  /**
   * Zoom in/out on the center of the screen.
   * @param {boolean} isZoomIn True to zoom, false to zoom out.
   * @param {number} amount How much to scale the zoom from the current value.
   */

  Camera.prototype.zoomCenter = function(isZoomIn, amount) {
    var width = GameState.screen.width;
    var height = GameState.screen.height;
    this.zoom(width/2, height/2, isZoomIn, amount);
  };


  /**
   * Zoom in/out on the given point in screen space. Example: 0, 0 would zoom in
   * on the top/left corner.
   * @param {number} x coordinate in screen space
   * @param {number} y coordinate in screen space
   * @param {boolean} isZoomIn True to zoom in. False to zoom out.
   * @param {number} amount Amount to scale zoome by.
   */
  Camera.prototype.zoom = function(x, y, isZoomIn, amount) {
    var root = this.root;
    var direction = isZoomIn ? 1 : -1;
    var factor = (1 + direction * amount);


    var beforeTransform = this.toLocal(x, y);
    root.scale.x *= factor;
    root.scale.y *= factor;
    var afterTransform = this.toLocal(x, y);

    root.position.x += (afterTransform.x - beforeTransform.x) * root.scale.x;
    root.position.y += (afterTransform.y - beforeTransform.y) * root.scale.y;
    root.updateTransform();
  };

  /**
   * Converts x/y values in screen space to world space.
   */
  Camera.prototype.toLocal = (function() {
    var temp = new Vector(0, 0);
    return function(x, y) {
      return this.root.toLocal(temp.set(x, y));
    };
  }()); 

  return Camera;
});

