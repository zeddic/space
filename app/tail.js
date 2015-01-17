define(function(require) {

  var PIXI = require('lib/pixi');
  var GameState = require('game-state');
  var Interval = require('util/interval');
  var Vector = require('vector');

  var texture = PIXI.Texture.fromImage("textures/laser4.png");  
 
  var DEFAULT_LENGTH = 20;

  function Tail(ship, options) {

    var options = options || {};

    /** @type {GameObject} */
    this.ship = ship;

    /**
     * Sample a new tail position on this interval
     * @type {Interval}
     */
    this.iSamplePosition = new Interval(20).randomize();

    /** 
     * A series of points that make up the tail.
     * @type {Array.<Vector>}
     */
    this.points = Array(options.length || DEFAULT_LENGTH);
    this.points.map(function() { return new Vector(0, 0); } );

    /** @type {PIXI.Rope} */
    this.rope = new PIXI.Rope(texture, this.points);
    this.rope.alpha = .5;

    /** @type {boolean} */
    this.setup = false;

    GameState.root.addChild(this.rope);

    // TODO(scott): Remove the tail when the ship is.
    // Can the tail be tied to the ship so this happens on it's own?
  }

  Tail.prototype.update = function() {
    if (!this.setup) {
      this.reset();
      this.setup = true;
    }

    var here = this.origin();
    if (this.iSamplePosition.update()) {
      this.points.unshift(here);
      this.points.pop();
    } else {
      this.points[0] = here;
    }
  }

  Tail.prototype.origin = function() {
    return this.ship.radiusPointByRad(Math.PI, 0);
  }


  Tail.prototype.reset = function() {
    var here = this.origin();
    for (var i = 0; i < this.points.length; i++) {
      this.points[i] = here;
    }
  }

  return Tail;
});

