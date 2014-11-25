var game = {};

/**
 * @type {angular.Module}
 */
game.module = angular.module('game', []);

game.module.controller('CardController', function($element, $scope) {

  start();

  $scope.behavior = 'steering';
  $scope.rotation = 0;
  $scope.activeColor = space.colors.WHITE;
  $scope.colors = [];

  space.colors.colors.forEach(function(color) {
    $scope.colors.push({
      raw: color,
      hex: '#' + decimalToHexString(color)
    });
  });

  var syncSettings = function() {
    space.game.setSpawnColor($scope.activeColor);

    var cstr = NullBehavior;
    switch($scope.behavior) {
      case 'ai': cstr = FlyAtTarget; break;
      case 'noop': cstr = NullBehavior; break;
      case 'spin': cstr = SpinyBehavior; break;
      case 'erratic': cstr = ErraticBehavior; break;
      case 'steering': cstr = SteeringBehavior; break;
      case 'mouse': cstr = FollowMouseBehavior; break;
      case 'flock': cstr = FlockBehavior; break;
    }
    space.game.setSpawnBehavior(cstr);
    space.game.setSpawnRotation(Number($scope.rotation));
  };

  $scope.dismiss = function() {
    $element.hide();
  };

  $scope.randomize = space.game.randomize;

  $scope.selectColor = function(color) {
    $scope.activeColor = color.raw;
    syncSettings();
  };

  $scope.$watch('behavior', syncSettings);
  $scope.$watch('rotation', syncSettings);

  syncSettings();
});
