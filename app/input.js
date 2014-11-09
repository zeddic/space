var Key = {
  pressed: {},

  W: 87,
  A: 65,
  S: 83,
  D: 68,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  SPACE: 32,
  
  isDown: function(keyCode) {
    return this.pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this.pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this.pressed[event.keyCode];
  }
};

window.addEventListener('keyup', function(event) {
  Key.onKeyup(event);
}, false);

window.addEventListener('keydown', function(event) {
  Key.onKeydown(event);
}, false);
