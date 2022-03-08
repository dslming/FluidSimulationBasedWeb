  function buildShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    //log any errors
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(shader));
    }
    return shader;
  };

  //we don't have to specify any or all attribute location bindings
  //any unspecified bindings will be assigned automatically and can be queried with program.getAttribLocation(attributeName)
  function WrappedProgram(wgl, vertexShaderSource, fragmentShaderSource, requestedAttributeLocations) {
    this.uniformLocations = {};
    this.uniforms = {}; //TODO: if we want to cache uniform values in the future

    var gl = wgl.gl;

    //build shaders from source
    var vertexShader = buildShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = buildShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    //create program and attach shaders
    var program = this.program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    //bind the attribute locations that have been specified in attributeLocations
    if (requestedAttributeLocations !== undefined) {
      for (var attributeName in requestedAttributeLocations) {
        gl.bindAttribLocation(program, requestedAttributeLocations[attributeName], attributeName);
      }
    }
    gl.linkProgram(program);


    //construct this.attributeLocations (maps attribute names to locations)
    this.attributeLocations = {};
    var numberOfAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (var i = 0; i < numberOfAttributes; ++i) {
      var activeAttrib = gl.getActiveAttrib(program, i);
      var attributeName = activeAttrib.name;
      this.attributeLocations[attributeName] = gl.getAttribLocation(program, attributeName);
    }

    //cache uniform locations
    var uniformLocations = this.uniformLocations = {};
    var numberOfUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < numberOfUniforms; i += 1) {
      var activeUniform = gl.getActiveUniform(program, i),
        uniformLocation = gl.getUniformLocation(program, activeUniform.name);
      uniformLocations[activeUniform.name] = uniformLocation;
    }
  };

  //TODO: maybe this should be on WrappedGL?
  WrappedProgram.prototype.getAttribLocation = function(name) {
    return this.attributeLocations[name];
  };


  export { WrappedProgram }
