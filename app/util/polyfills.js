// TODO(scott): Move these to util functions. Polyfills don't
// play very nice with RequireJS.

Array.prototype.remove = function(item) {
  var index = this.indexOf(item);
  if (index !== -1) {
    this.splice(index, 1);
  }
};

Array.prototype.contains = function(item) {
  return this.indexOf(item) !== -1;
};

Math.sign = function(x) {
  x = +x;
  if (x === 0 || isNaN(x))
    return x;
  return x > 0 ? 1 : -1;
}