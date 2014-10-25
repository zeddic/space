Vector = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

Vector.prototype.clone = function() {
  return new Vector(this.x, this.y);
};

Vector.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
  return this;
};

Vector.prototype.addTo = function(v) {
  v.add(this);
  return this;
}

Vector.prototype.sub = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  return this;
};

Vector.prototype.invert = function(v) {
  this.x *= -1;
  this.y *= -1;
  return this;
};

Vector.prototype.multiplyScalar = function(s) {
    this.x *= s;
    this.y *= s;
    return this;
};

Vector.prototype.divideScalar = function(s) {
    if(s === 0) {
        this.x = 0;
        this.y = 0;
    } else {
        var invScalar = 1 / s;
        this.x *= invScalar;
        this.y *= invScalar;
    }
    return this;
};

Vector.prototype.dot = function(v) {
  return this.x * v.x + this.y * v.y;
};

Vector.prototype.length = function(v) {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.lengthSq = function() {
  return this.x * this.x + this.y * this.y;
};

Vector.prototype.normalize = function() {
  return this.divideScalar(this.length());
};

Vector.prototype.distanceTo = function(v) {
  return Math.sqrt(this.distanceToSq(v));
};

Vector.prototype.distanceToSq = function(v) {
  var dx = this.x - v.x;
  var dy = this.y - v.y;
  return dx * dx + dy * dy;
};

Vector.prototype.set = function(x, y) {
  this.x = x;
  this.y = y;
  return this;
};

Vector.prototype.setX = function(x) {
  this.x = x;
  return this;
};

Vector.prototype.setY = function(y) {
  this.y = y;
  return this;
};

Vector.prototype.setLength = function(l) {
  var oldLength = this.length();
  if(oldLength !== 0 && l !== oldLength) {
    this.multiplyScalar(l / oldLength);
  }
  return this;
};

Vector.prototype.invert = function(v) {
  this.x *= -1;
  this.y *= -1;
  return this;
};

Vector.prototype.lerp = function(v, alpha) {
  this.x += (v.x - this.x) * alpha;
  this.y += (v.y - this.y) * alpha;
  return this;
};

Vector.prototype.rad = function() {
  return Math.atan2(this.x, this.y);
};

Vector.prototype.deg = function() {
  return this.rad() * 180 / Math.PI;
};

Vector.prototype.equals = function(v) {
  return this.x === v.x && this.y === v.y;
};

Vector.prototype.rotate = function(theta) {
  var xtemp = this.x;
  this.x = this.x * Math.cos(theta) - this.y * Math.sin(theta);
  this.y = xtemp * Math.sin(theta) + this.y * Math.cos(theta);
  return this;
};

// constructor
Vector.prototype.constructor = Vector;