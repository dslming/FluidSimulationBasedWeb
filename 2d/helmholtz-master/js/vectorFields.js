var pi = Math.PI;

vectorFields = {

    ionCannon : {
        p : function(x,y){
            return Math.cos(1*pi*y);
        },
        q : function(x,y){
            return Math.cos(1*pi*x);
        }
    },

    spring : {
        p : function(x,y){
            return .7 - x;
        },
        q : function(x,y){
            return -y;
        }
    },

    vortex : {
        p : function(x,y){
            return y;
        },
        q : function(x,y){
            return -x;
        }
    },

    vortices : {
        p : function(x,y){
            return Math.cos(2*pi*y);
        },
        q : function(x,y){
            return Math.cos(2*pi*x);
        }
    },

    diamondAttractor : {
        p : function(x,y){
            return Math.sin(1.5*pi*x);
        },
        q : function(x,y){
            return Math.sin(1.5*pi*y);
        }
    },

    circleAttractor : {
        p : function(x,y){
            return (.75 - Math.sqrt(x*x + y*y)) * x / Math.sqrt(x*x + y*y);
        },
        q : function(x,y){
            return (.75 - Math.sqrt(x*x + y*y)) * y / Math.sqrt(x*x + y*y);
        }
    },

    circleAttractorSpin : {
        p : function(x,y){
            if (Math.abs(Math.sqrt(x*x + y*y) - .75) < .04)
                return y;
            else
                return (.75 - Math.sqrt(x*x + y*y)) * x / Math.sqrt(x*x + y*y);
        },
        q : function(x,y){
            if (Math.abs(Math.sqrt(x*x + y*y) - .75) < .04)
                return -x;
            else
                return (.75 - Math.sqrt(x*x + y*y)) * y / Math.sqrt(x*x + y*y);
        }
    },

    figureEight : {
        p : function(x,y){
            return Math.sin(y);
        },
        q : function(x,y){
            return Math.sin(1.5*pi*x);
        }
    },

    gravity : {
        p : function(x,y){
            return 0;
        },
        q : function(x,y){
            return -1;
        }
    },

    butt : {
        p : function(x,y){
            return x*x - y*y;
        },
        q : function(x,y){
            return 2*x*y;
        }
    },

    none : {
        p : function(x,y){
            return 0;
        },
        q : function(x,y){
            return 0;
        }
    }
};

for (var key in vectorFields){
    var selection = $('<option>').attr('value',key).html(key);
    $('#vf_select').append(selection)
}