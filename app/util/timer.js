define(function(require) {

  var random = require('util/random');

  var FPS = 60;
  var MILLIS_PER_UPDATE = 1000 / FPS;


  /**
   * A utility class for triggering something after a period of time.
   * @constructor
   */
  function Timer(millis) {

    /** @type {number} Target time that is being counted up to. */
    this.target = millis;

    /** @type {number} The counter incremented ever update */
    this.count = 0;

    /** @type {number} The time that passes per frame. */
    this.delta = MILLIS_PER_UPDATE;

    /** @type {boolean} True once the timer has reached the given time. */
    this.done = false;

    /** @type {boolean} True if the timer is paused and not updating. */
    this.paused = false;

  };


  /**
   * Randomizes the timers progress. Useful when many items on the screen
   * are initialized at the same time and you want to distribute when
   * the timer is triggered.
   */
  Timer.prototype.randomize = function() {
    this.count = random.value(0, this.target);
    return this;
  };


  /**
   * Percentage to being done (between 0 and 1.)
   */
  Timer.prototype.percent = function() {
    return Math.max(0, Math.min(1, this.count / this.target));
  };


  /**
   * Updates the timer. Returns true if the target time was reached as a
   * result of this update.  If a timer has already reached it's target
   * in a prior update, returns false.
   *
   *
   * @return {boolean} True if the timer reached the end from this update.
   */
  Timer.prototype.update = function() {
    if (this.paused || this.done) {
      return false;
    }

    this.count = Math.min(this.count + this.delta, this.target);

    if (this.count >= this.target) {
      this.done = true;
    }

    return this.done;
  };


  /**
   * Changes the target duration of the timer. A timer that was previously done
   * may start counting again if this is greater than the original time.
   */
  Timer.prototype.duration = function(millis) {
    this.target = millis;
    this.count = Math.min(this.count, this.target);
    this.done = this.count >= this.target;
  };


  /**
   * Resets the timer back to 0.
   */
  Timer.prototype.reset = function() {
    this.count = 0;
    this.done = false;
  };


  /**
   * Pasues updates to the timer. Calls to update when a timer is paused do nothing.
   */
  Timer.prototype.pause = function() {
    this.paused = true;
  };


  /**
   * Resumes a pused timer.
   */
  Timer.prototype.resume = function() {
    this.paused = false;
  }

  return Timer;
});

