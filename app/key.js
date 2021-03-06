define(function() {  
  var Key = {
    pressed: {},
    
    Q: 81, 
    Z: 90,
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    E: 69,
    J: 74,
    K: 75,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SHIFT: 16,
    SPACE: 32,
    COMMAND: 91,
    
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

  return Key;
});