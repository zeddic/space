define(function() {

  /**
   * A utility class that can trigger function(s) so many times per second as
   * part of the update() pass. Useful for introducing rate limits on particular
   * actions. 
   *
   * For example: 
   *
   *  (1) Fire bullets at most 6 times per second
   *  (2) Search for a new target once every 10 seconds
   *
   * @param {number} timesPerSecond The number of times per second to trigger functions.
   *     Defaults to 1 times per second.
   * @param {=boolean} opt_randomize If true, randomizes the starting progress of the
   *     interval. Useful when seeding the world with lots of entities so a bunch
   *     of expensive intervals don't all trigger at the same time.
   * @constructor
   */
  function Interval(timesPerSecond, opt_randomize) {

    var randomize = !!opt_randomize;

    /** @type {Array.<Interval>} */
    this.children = [];

    /** @type {number} A threshold that will trigger the interval when reached. */
    this.limit = 100;

    /** @type {number} The counter incremented ever update */
    this.count = randomize ? rand(0, 100) : 0;

    /** @type {number} How much to increment every update */
    this.delta = timesPerSecond * this.limit / Interval.FPS;

    /** @type {Array.<Function>} Functions to trigger when limit reached. */
    this.targets = [];

    this.triggerNext = false;
  };


  /**
   * The target updates per second for the 
   */
  Interval.FPS = 60;


  /**
   * Adds a child interval. The child interval will only be updated
   * when the parent interval is triggered.
   */
  Interval.prototype.child = function(interval) {
    this.children.push(interval);
    return this;
  };


  /**
   * Randomizes the intervals progress.
   */
  Interval.prototype.randomize = function() {
    this.count = rand(0, 100);
    return this;
  };


  Interval.prototype.triggerOnNextUpdate = function() {
    this.triggerNext = true;
    return this;
  };


  /**
   * Updates the interval but does not trigger anything if the limit is reached.
   */
  Interval.prototype.updateOnly = function() {
    return this.update(false);
  };


  /**
   * Updates the interval. If the limit is reached:
   * (1) Trigger all callbacks/targets
   * (2) Update all children intervals
   * (3) Reset the counter
   *
   * @param {boolean} opt_trigger Whether to trigger callback/children
   *     when the interval limit is reached. Defaults to true. If false,
   *     the interval will stay at the limit until it is triggered by
   *     either a future update or a manual call to trigger().
   * @return {boolean} True if the interval was triggered and reset.
   */
  Interval.prototype.update = function(opt_trigger) {
    var trigger = (opt_trigger === undefined) ? true : opt_trigger;
    this.count = Math.min(this.count + this.delta, this.limit);
    return trigger && this.trigger();
  };


  /**
   * Triggers the interval if it is time to fire. Otherwise, does nothing.
   * @return {boolean} True if the interval was triggered.
   */
  Interval.prototype.trigger = function() {
    if (this.count < this.limit && !this.triggerNext) {
      return false;
    }

    this.triggerNext = false;
    this.count = 0;

    for (var i = 0, target; target = this.targets[i]; i++) {
      target();
    }

    for (var i = 0, child; child = this.children[i]; i++) {
      child.update(opt_trigger);
    }

    return true;
  };


  /**
   * Registers a new callback to be triggered when the interval is reached.
   */
  Interval.prototype.target = function(fn, opt_scope) {
    this.targets.push(opt_scope ? fn.bind(opt_scope) : fn);
    return this;
  };


  return Interval;

});

