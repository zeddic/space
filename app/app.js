var game = {};

/**
 * @type {angular.Module}
 */
game.module = angular.module('game', []);

game.module.controller('CardController', function($element, $scope) {
  $scope.dismiss = function() {
    $element.hide();
  };
});
