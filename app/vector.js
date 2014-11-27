define(function() {  

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

Vector.prototype.addMultiple = function(v, s) {
  this.x += (v.x * s);
  this.y += (v.y * s);
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

Vector.prototype.multiply = function(s) {
  return this.multiplyScalar(s);
};

Vector.prototype.multiplyScalar = function(s) {
  this.x *= s;
  this.y *= s;
  return this;
};

Vector.prototype.scale = function(s) {
  return this.multiply(s);
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

Vector.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.lengthSq = function() {
  return this.x * this.x + this.y * this.y;
};

Vector.prototype.len = function() {
  return this.length();
};

Vector.prototype.len2 = function() {
  return this.lengthSq();
}

Vector.prototype.normalize = function() {
  return this.divideScalar(this.length());
};

Vector.prototype.truncate = function(max) {
  if (this.lengthSq() > max * max) {
    this.normalize().multiply(max);
  }

  return this;
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

Vector.prototype.isNull = function() {
  return this.x == 0 && this.y == 0;
};

Vector.prototype.rad = function() {
  //return Math.atan2(this.x, this.y);
  return Math.atan2(this.y, this.x);
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

Vector.prototype.fromRad = function(rad, opt_length) {
  var l = (opt_length == undefined) ? 1 : opt_length;
  this.x = l * Math.cos(rad);
  this.y = l * Math.sin(rad);
  return this;
};

Vector.fromRad = function(rad, opt_length) {
  return new Vector().fromRad(rad, opt_length);
};

Vector.delta = function(v1, v2) {
  if (v1.position && v2.position) {
    return new Vector(
        v1.position.x - v2.position.x,
        v1.position.y - v2.position.y);
  }

  return new Vector(v1.x - v2.x, v1.y - v2.y);
};

Vector.of = function(x, y) {
  return new Vector(x, y);
};


// constructor
Vector.prototype.constructor = Vector;

return Vector;

});  // end define
