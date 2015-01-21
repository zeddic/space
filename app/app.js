define(function(require) {

  var Color = require('util/color');
  var angular = require('lib/angular');
  var createGame = require('game');
  var behaviors = require('behaviors');
  var util = require('util/util');
  var GameState = require('game-state');


  var space = {};

  /**
   * @type {angular.Module}
   */
  space.module = angular.module('game', []);

  space.module.controller('CardController', function($element, $scope) {

    var game = createGame();
    game.start();

    $scope.state = GameState;
    $scope.behavior = 'mouse';
    $scope.rotation = 0;
    $scope.activeColor = Color.WHITE;
    $scope.colors = [];

    Color.colors.forEach(function(color) {
      $scope.colors.push({
        raw: color,
        hex: '#' + util.decimalToHexString(color)
      });
    });

    var syncSettings = function() {
      game.setSpawnColor($scope.activeColor);

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
      game.setSpawnBehavior(cstr);
      game.setSpawnRotation(Number($scope.rotation));
    };

    $scope.dismiss = function() {
      $element.hide();
    };

    $scope.randomize = game.randomize;

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
