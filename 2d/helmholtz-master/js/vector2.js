function Vector2(x,y){
    this.x = x;
    this.y = y;
};

Vector2.prototype.set = function(x,y){
    this.x = x;
    this.y = y;
    return this;
};

Vector2.prototype.add = function(v){
    return new Vector2(this.x + v.x, this.y + v.y);
};

Vector2.prototype.sub = function(v){
    return new Vector2(this.x - v.x, this.y - v.y);
};

Vector2.prototype.mult = function(r){
    return new Vector2(r*this.x, r*this.y);
};

Vector2.prototype.div = function(r){
    return new Vector2(1/r*this.x, 1/r*this.y);
};

Vector2.prototype.dot = function(v){
    return this.x * v.x + this.y * v.y;
};

Vector2.prototype.norm = function(){
    return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
};

Vector2.prototype.normalize = function(){
    var norm = this.norm();
    if (norm != 0)
        return this.div(norm);
    else
        return this;
};

Vector2.prototype.reflect = function(normal,restitution){
    restitution = restitution || 1;
    var n = normal.normalize();
    var diff = n.mult((1+restitution)*n.dot(this));
    return this.subFrom(diff);
};

Vector2.prototype.addFrom = function(v){
    this.x += v.x;
    this.y += v.y;
    return this;
};

Vector2.prototype.subFrom = function(v){
    this.x -= v.x;
    this.y -= v.y;
    return this;
};

Vector2.prototype.multFrom = function(r){
    this.x *= r;
    this.y *= r;
    return this;
};

Vector2.prototype.divFrom = function(r){
    this.x *= 1/r;
    this.y *= 1/r;
    return this;
};