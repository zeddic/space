
/**
 * A utility class that can trigger function(s) so many times per second as
 * part of the update() pass. Useful for introducing rate limits on particular
 * actions. 
 *
 * For example: 
 *
 *  (1) Fire bullets at most 6 times per second
 *  (2) Search for a new target once very 10 seconds
 *
 * @param {=number} opt_timesPerSecond The number of times per second to trigger functions.
 *     Defaults to 1 times per second.
 * @constructor
 */
function Interval(opt_timesPerSecond) {

  /** @type {Array.<Interval>} */
  this.children = [];

};


/**
 *
 */
Interval.prototype.child = function(interval) {
  this.children.push(interval);
};


Interval.prototype.update = function(opt_trigger) {

  var trigger = (opt_trigger === undefined) ? true : opt_trigger;


  if (trigger) {
    this.trigger();
  }
};

Interval.prototype.trigger = function() {

};

Interval.prototype.target = function(fn, opt_scope) {

};



