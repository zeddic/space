define(function(require) {

  var $ = require('jquery');
  var Vector = require('vector');
  var el = $('.game-content');
  
  var state = {};

  /**
   * The root element to render within.
   * @type {Element}
   */
  state.el = el;

  /**
   * The PIXI renderer.
   */
  state.renderer = null;

  /**
   * The current screen dimensions.
   */
  state.screen = {
    width: el.innerWidth(),
    height: el.innerHeight()
  }

  /**
   * The last observed position of the mouse.
   */
  state.mouse = new Vector(0, 0);

  // Listen for screen resizes.
  $(window).resize(function() {
    state.screen.width = el.innerWidth();
    state.screen.height = el.innerHeight();
    state.renderer && state.renderer.resize(
        state.screen.width, 
        state.screen.height);
  });

  return state;
});
