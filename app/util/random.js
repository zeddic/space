define(function() {

  var random = {};

  random.value = function(min, max) {
    return Math.random() * (max - min) + min;
  };

  random.valueInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  random.between = function() {

  };

  return random;
});