function VectorField(vf){

    //randomly assign a vector field if none provided
    if (vf == undefined){
        var keys = [];
        var length = 0;
        for (var key in vectorFields){
            keys.push(key);
            length++;
        }

        var randIndex = Math.floor(length*Math.random());
        console.log(randIndex)
        key = keys[randIndex];
        vf = vectorFields[key];
    }

    this.p = vf.p;
    this.q = vf.q;

    this.canvasID = 'vectorField';
    this.canvas = document.getElementById(this.canvasID);
    this.ctx = this.canvas.getContext('2d');

    this.canvas.height = $('#world').height();
    this.canvas.width = $('#world').width();

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.xy2uv = function(x,y){
        return {
            u : 2 * x / this.width - 1,
            v : 1 - 2 * y / this.height
        };
    };

    this.uv2xy = function(u,v){
        return {
            x : (1 + u)/2 * this.width,
            y : (1 - v)/2 * this.height
        };
    };

}

VectorField.prototype.eval = function(x,y){

    var pt = this.xy2uv(x,y);
    return new Vector2(this.p(pt.u,pt.v), -this.q(pt.u,pt.v));

}

VectorField.prototype.drawQuiver = function(x,y){

    var v = this.eval(x,y).mult(10);
    var ctx = this.ctx;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + v.x, y + v.y);
    ctx.lineWidth = 1;
    ctx.arc(x + v.x, y + v.y, 2 , 0, 2 * pi);
    ctx.stroke();
    ctx.fill();

}

VectorField.prototype.draw = function(){

    //color background
    var pos = 0; // index position into imagedata array

    var imageData = this.ctx.createImageData(this.width, this.height);
    var r, g, b, norm;

    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {

            norm = 255*this.eval(x,y).norm()
            // calculate RGB values based on sine
            r = norm/3;
            g = norm/3;
            b = norm;

            // set red, green, blue, and alpha:
            imageData.data[pos++] = Math.max(0,Math.min(255, r));
            imageData.data[pos++] = Math.max(0,Math.min(255, g));
            imageData.data[pos++] = Math.max(0,Math.min(255, b));
            imageData.data[pos++] = 200; // opaque alpha
        }
    }

    this.ctx.putImageData(imageData, 0, 0);

    // draw quiver plot
    var minX = -1,
        minY = -1,
        maxX =  1,
        maxY =  1;

    var step = .05 - .000000000001;

    for (x = minX; x <= maxX; x += step){
        for (y = minY; y <= maxY; y += step){
            var pt = this.uv2xy(x,y);
            this.drawQuiver(pt.x,pt.y);
        }
    }

}