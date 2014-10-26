Ship = function(x, y, opt_color) {  
  PIXI.Sprite.call(this, Ship.texture);

  this.position.x = x;
  this.position.y = y;
  this.width = 20;
  this.height = 20;
  this.anchor.x = .4;
  this.anchor.y = .5;
  this.radius = 8;

  this.target = null;
  this.tint = opt_color || space.colors.random();

  this.velocity = new Vector();
  this.speed = 3;

  this.waitDistance = 20;
  this.mass = 5;
};

Ship.prototype = Object.create(PIXI.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.texture = PIXI.Texture.fromImage('textures/ship.png');

Ship.prototype.addTo = function(stage) {
  stage.addChild(this);
};

Ship.prototype.position = function(x, y) {
  this.position.x = x;
  this.position.y = y;
};

Ship.prototype.update = function() {
  this.updateVelocity();
  this.position.add(this.velocity);

  //graphics.lineStyle(1, 0xFFFFFF);
  //graphics.drawCircle(this.position.x, this.position.y, this.radius);
  //graphics.lineStyle(1, 0xFFFFFF);
  //graphics.drawRect(this.sprite.position.x, this.sprite.position.y, this.sprite.width, this.sprite.height);
  //graphics.drawRect(this.left(), this.top(), this.sprite.width, this.sprite.height);
};


Ship.prototype.left = function() {
  return this.x - this.width / 2;
};

Ship.prototype.top = function() {
  return this.y - this.height / 2;
};

Ship.prototype.right = function() {
  return this.x + this.width / 2;
};

Ship.prototype.bottom = function() {
  return this.y + this.height / 2;
};

Ship.prototype.updateVelocity = function() {
  if(!this.target) {
    return;
  }

  var target = this.target;

  var dX = target.x - this.x;
  var dY = target.y - this.y;
  var distance = this.position.distanceTo(target);

  if (distance < this.waitDistance) {
    this.velocity.set(0, 0);
    return;
  }

  var scaler = Math.min(distance, this.speed);
  
  this.velocity.x = dX;
  this.velocity.y = dY;
  this.velocity.normalize();
  this.velocity.x *= scaler;
  this.velocity.y *= scaler;

  this.rotation = -this.velocity.rad() + (Math.PI / 2);
}

Ship.prototype.collide = function(other) {

  if (other instanceof Planet && other.position == this.target) {
    var state = space.state;
    var entities = state.entities;
    state.stage.removeChild(this);

    var index = entities.indexOf(this);
    if(index !== -1) {
      entities.splice(index, 1);
    }

    if (other.tint == this.tint) {
      other.population++;
    } else {
      other.population--;
      if (other.population == 0) {
        other.population = 1;
        other.tint = this.tint;
      }
    }
  }
};

Planet = function(x, y) {
  PIXI.Sprite.call(this, Planet.TEXTURE);
  this.position.x = x;
  this.position.y = y;
  this.anchor.x = .5;
  this.anchor.y = .5;
  this.tint = Math.random();
  //this.tint = 0x0022FF;
  this.tint = space.colors.random();
  this.radius = rand(25, 65);

  var scale = this.getScale();
  var size = scale * Planet.NATIVE_SIZE;

  this.width = size;
  this.height = size;
  this.mass = scale * Planet.NATIVE_MASS;
  this.velocity = new Vector(0, 0);
  this.interactive = true;

  this.population = 10;

  this.text = new PIXI.Text(this.population, Planet.TEXT_STYLE);
  this.text.anchor.x = .5;
  this.text.anchor.y = .5;
  this.addChild(this.text, Planet.TEXT_STYLE);

  this.popRate = scale * Planet.NATIVE_RATE;
  this.popCounter = 0;
  this.maxPopulation = scale * Planet.NATIVE_MAX_POPULATION;
};

Planet.prototype = Object.create(PIXI.Sprite.prototype);
Planet.prototype.constructor = Planet;

Planet.TEXTURE = PIXI.Texture.fromImage('textures/planet.png');
Planet.NATIVE_RADIUS = 32;
Planet.NATIVE_SIZE = 64;
Planet.NATIVE_MASS = 9999;
Planet.NATIVE_RATE = 1.5;
Planet.NATIVE_MAX_POPULATION = 50;
Planet.TEXT_STYLE = {
  fill: 'white'
};

Planet.prototype.setText = function(newText) {
  this.text.setText(newText);
};

Planet.prototype.getScale = function() {
  return this.radius / Planet.NATIVE_RADIUS;
};

Planet.prototype.update = function() {
  this.popCounter += this.popRate;
  if (this.popCounter > 100 && this.population < this.maxPopulation) {
    this.popCounter = 0;
    this.population++;
  }

  this.text.setText(this.population);
  //graphics.lineStyle(1, 0xFF0000);
  //graphics.drawCircle(this.position.x, this.position.y, this.radius);
};

/**
 * Given a target point in the world, returns the x/y coordinates of the planets
 * edge that points toward that point. If an optional offset is set, the point
 * will be beyond the edge of the planet.
 */
Planet.prototype.getEdgePoint = function(target, opt_offset) {
  var offset = opt_offset || 0;
  return target.clone().
      sub(this.position).
      normalize().
      multiplyScalar(this.radius + offset).
      add(this.position);
};

Planet.prototype.contains = function(point) { 
  return space.util.within(point, this);
};
