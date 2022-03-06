function Canvas(id){

    this.id = id || 'vectorField';
    this.$el = $('#' + this.id);

    this.width  = this.$el.width();
    this.height = this.$el.height();

    this.XYtoUV = function(x,y){
        var width = this.width;
        var height = this.height;

        return {
            u : (1 + x)/2 * width,
            v : (1 - y)/2 * height
        };
    }
}