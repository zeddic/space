define(function(require) {

  var angular = require('lib/angular');
  var createGame = require('game');
  var behaviors = require('behaviors');

  function start() {
    space.game = createGame();
    space.game.start();
  }

  var game = {};

  /**
   * @type {angular.Module}
   */
  game.module = angular.module('game', []);

  game.module.controller('CardController', function($element, $scope) {

    start();

    $scope.behavior = 'mouse';
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

      var cstr = behaviors.NullBehavior;
      switch($scope.behavior) {
        case 'ai': cstr = behaviors.FlyAtTarget; break;
        case 'noop': cstr = behaviors.NullBehavior; break;
        case 'spin': cstr = behaviors.SpinyBehavior; break;
        case 'erratic': cstr = behaviors.ErraticBehavior; break;
        case 'steering': cstr = behaviors.SteeringBehavior; break;
        case 'mouse': cstr = behaviors.FollowMouseBehavior; break;
        case 'flock': cstr = behaviors.FlockBehavior; break;
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

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['game']);
  });
});
