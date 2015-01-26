define(function(require) {

  var Timer = require('util/timer');
  var PI = Math.PI;

  /**
   * Transitions a value between a range over a specified duration and
   * animation type.
   *
   * For example: transition X between 5 and 10 over 3 seconds, easing in
   * and out.
   *
   * Transition state is only updated as part of the game loop when
   * {@code update()} is called. {@code value()} may be used to obtain the
   * current tween state. Auto-reset and Auto-Reverse may be used to create
   * continuous transitions in a loop.
   *
   * Transitions may be created by either providing all parameters at construction
   * time, or by using chaining:
   *
   * new Transition().between(5, 10).duration(3000).type(Transition.Type.LOG);
   *
   * @param {number} start The start of the range to transition between.
   * @param {number} end The end of the range to transition between.
   * @param {number} duration The duration (in milliseconds) of the transition.
   * @param {Function} tweenFn A tween function that represents how the transition
   *     should animation. This function should take a value between 0-1 and return
   *     a new value between 0-1. Built in tween functions may be found in
   *     Transition.Type.
   *
   * @constructor
   */
  function Transition(start, end, duration, tweenFn) {

    this.start_ = start || 0;

    this.end_ = end || 1;

    this.tweenFn_ = tweenFn || Transition.Type.LINEAR;

    this.value_ = 0;

    this.timer_ = new Timer(duration);

    this.autoReset_ = false;

    this.autoReverse_ = false;

    this.updateValue_();
  };

  Transition.prototype.to = function(end) {
    this.end_ = end;
    this.updateValue_();
    return this;
  }

  /**
   * Sets the range of the transition.
   */
  Transition.prototype.between = function(start, end) {
    this.start_ = start;
    this.end_ = end;
    this.updateValue_();
    return this;
  };

  /**
   * Sets the duration (in millis) of the transition.
   */
  Transition.prototype.duration = function(duration) {
    this.timer_.duration(duration);
    this.updateValue_();
    return this;
  };

  /**
   * Sets how the transition should tween between the range. See constructor
   * for more details.
   */
  Transition.prototype.type = function(type) {
    this.tweenFn_ = type;
    this.updateValue_();
    return this;
  };

  /**
   * Sets whether the transition should restart automatically whenver it reaches the end.
   * This results in a continuous loop.
   */
  Transition.prototype.autoReset = function(autoReset) {
    this.autoReset_ = this.autoReset;
    return this;
  };

  /**
   * Sets whether the transition should continuously oscillate within the range.
   * When the transition reaches it's end, it will reverse backends, then start again.
   */
  Transition.prototype.autoReverse = function(autoReverse) {
    this.autoReverse_ = autoReverse;
    return this;
  };

  /**
   * Gets the current tweened value.
   */
  Transition.prototype.value = function() {
    return this.value_;
  };

  /**
   * Updates the transition value, assuming the target FPS.
   */
  Transition.prototype.update = function() {
    this.timer_.update();

    if (this.timer_.done) {
      if (this.autoReset_ || this.autoReverse_) {
        this.reset();
        this.autoReverse_ && this.reverse();
      }
    }

    this.updateValue_();
  };

  /**
   * Resets the transition back to start.
   */
  Transition.prototype.reset = function() {
    this.timer_.reset();
    this.updateValue_();
    return this;
  };


  /**
   * Reverses the direction of the transition.
   */
  Transition.prototype.reverse = function() {
    var temp = this.start_;
    this.start_ = this.end_;
    this.end_ = temp;
    return this;
  };


  Transition.prototype.updateValue_ = function() {
    var percent = this.tweenFn_(this.timer_.percent());
    this.value_ = this.start_ + percent * (this.end_ - this.start_);
  };


  /**
   * Preset transition types.
   */
  Transition.Type = {
    LINEAR: function(p) { return p; },
    EASE_IN_OUT: function(p) {
      if (( p *= 2) < 1 ) return 0.5 * p * p * p;
      return 0.5 * (( p -= 2) * p * p + 2 );
    },
    LOG: function(p) { return Math.pow(p, 0.5); },
    EXPONENTIAL: function(p) { return Math.pow(p, 3); },
    SPRING: function(p) { return 1 - Math.cos(p * 4.5 * PI) * Math.pow(Math.E, (-p * 6)); }
  };

  return Transition;
});