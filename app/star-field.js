define(function(require) {
  var GameState = require('game-state');
  var PIXI = require('lib/pixi');

  // Defines the star field grid size in scren space.
  // Each grid gets 3 stars.
  var POWER_OF_TWO = 7;
  var GRID_SIZE = 1 << POWER_OF_TWO;
  var temp = new Vector(0, 0);

  /**
   * Renders a background of stars on the screen.
   */
  function StarField(root) {
    
    /** @type {PIXI.DisplayObjectContainer} */
    this.root = root;

    /**
     * Contains all stars displayed in a frame.
     * @type {PIXI.SpriteBatch}
     */
    this.sprites = new PIXI.SpriteBatch();

    GameState.background.fixed.container.addChild(this.sprites);
  };

  StarField.prototype.update = function() {
    // Clear stars from the last update.
    this.sprites.removeChildren();

    // Draw star layers (far to near)
    this.drawStars(3, 0x00002FFF, .3);
    this.drawStars(2, 0xEFC60000, .5);
    this.drawStars(1.5, 0x001FFFFF, .6);
    this.drawStars(1, 0x9d2c5680, .7);
  };

  /**
   * Draws stars for one parallax layer.
   *
   * Implementation details: This algorithim work bys dividing screen space into
   * a grid. For each entry in the grid, the grids row/col/seed combo is used
   * as a hash to generate the x/y coordinates for 3 stars. The entire grid is offset
   * based on the pan/zoom offset values currently affecting world space.
   *
   * Algorithim based off of: http://nullprogram.com/blog/2011/06/13/
   *
   * @param {number} scale A scale of how much stars should display the parallax effect.
   *     Small values cause stars to move little when the user moves pans/zooms (distant)
   *     Large values cause stars to move more when the user pans/zoom (near)
   * @param {number} seed A random value that will be used as a seed to procedurally
   *     generate x/y positions for stars. The same seed can consistently generate the
   *     same set of stars.
   * @param {number} alpha Alpha transparency to apply to stars.
   */
  StarField.prototype.drawStars = function(scale, seed, alpha) {
    // Aliases
    var g = GameState.background.fixed.graphics;
    var w = GameState.screen.width;
    var h = GameState.screen.height;
    var sprites = this.sprites;

    // Figure out how much stars should be offset to display the parallax
    // effect. Convert the middle of the screen to world space to see how
    // much pan/zoom has moved it.
    var local = this.toLocal(w/2, h/2);
    var offsetX = local.x / (40 * scale);
    var offsetY = local.y / (40 * scale);

    // Determine the grid cells that should be rendered to the screen.
    // Skip rendering cells if the parallax effect has pushed them
    // off the screen.
    var gridOffsetX = offsetX >> POWER_OF_TWO;
    var gridOffsetY = offsetY >> POWER_OF_TWO;
    var top = gridOffsetY - 2;
    var left = gridOffsetX - 2;
    var right = (w >> POWER_OF_TWO) + gridOffsetX + 2;
    var bottom = (h >> POWER_OF_TWO) + gridOffsetY + 2;

    // Draw each cell in the grid.
    for (var y = top; y <= bottom; y++) {
      for (var x = left; x < right; x++) {

        // Hash grid x/y/seed.
        var hash = hashValues(seed, x, y);
        var baseX = x << POWER_OF_TWO;
        var baseY = y << POWER_OF_TWO;

        // Use hash to generate 3 star positions within this grid cell.
        for (var n = 0; n < 3; n++) {
          var starX = Math.abs(hash % GRID_SIZE) + baseX - offsetX;
          hash = hash >> 3;
          var starY = Math.abs(hash % GRID_SIZE) + baseY - offsetY;
          hash = hash >> 3;

          var star = this.getStarSprite(hash, starX, starY, alpha);
          sprites.addChild(star);
        }
      }
    }
  };

  /**
   * Returns a PIXI sprite for a star. The type of sprite choosen
   * will be consistent based on the star's hash.
   * @param {number} hash The hash/seed used to create the star.
   * @param {number} x The x position of the star (in screen space).
   * @param {number} y The y position of the star (in screen space).
   * @param {number} alpha The alpha transparency to use for the star.
   */
  StarField.prototype.getStarSprite = function(hash, x, y, alpha) {
    var type = Math.abs(hash % 100);

    // TODO(scott): Switch this to an object pool.
    var url;
    switch (type) {
      case 0: url = 'textures/star1.png'; break;
      case 1: url = 'textures/star2.png'; break; 
      default: url = 'textures/star.png';
    }

    var sprite = PIXI.Sprite.fromImage(url);
    sprite.x = x;
    sprite.y = y;
    sprite.alpha = alpha;
    sprite.anchor.x = .5;
    sprite.anchor.y = .5;
    return sprite;
  }

  /**
   * Converts coordinates in screen space to world space.
   */
  StarField.prototype.toLocal = function(x, y) {
    return this.root.toLocal(temp.set(x, y));
  };

  /**
   * Returns a new value that represents a hash of the three parameters.
   * Used to procedurally generate x/y coordinates for stars based on their
   * grid.
   */
  function hashValues(a, b, c) {
    a=a-b;  a=a-c;  a=a^(c >>> 13);
    b=b-c;  b=b-a;  b=b^(a << 8);
    c=c-a;  c=c-b;  c=c^(b >>> 13);
    a=a-b;  a=a-c;  a=a^(c >>> 12);
    b=b-c;  b=b-a;  b=b^(a << 16);
    c=c-a;  c=c-b;  c=c^(b >>> 5);
    a=a-b;  a=a-c;  a=a^(c >>> 3);
    b=b-c;  b=b-a;  b=b^(a << 10);
    c=c-a;  c=c-b;  c=c^(b >>> 15);
    return c;
  }

  return StarField;
});
