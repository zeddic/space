var game = {};

/**
 * @type {angular.Module}
 */
game.module = angular.module('game', []);

game.module.controller('CardController', function() {
  console.log('in controller');
});
