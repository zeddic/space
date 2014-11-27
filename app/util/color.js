define(function(require) {

  var random = require('util/random');

  var RED = 0xF90101;
  var BLUE = 0x0266C8;
  var WHITE = 0xFFFFFF;
  var GREEN = 0x00933B;
  var ORANGE = 0xF2B50F;
  var colors = [RED, BLUE, WHITE, GREEN, ORANGE];

  return {
    random: function() {
      var color = colors[random.valueInt(0, colors.length - 1)];
      return color;
    },
    colors: colors,
    RED: RED,
    BLUE: BLUE,
    WHITE: WHITE,
    GREEN: GREEN,
    ORANGE: ORANGE
  };
});
