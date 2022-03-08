'use strict'
import { arraysEqual } from './state.js'
import { DrawState } from './drawState.js'
import { ClearState } from './clearState.js'
import { ReadState } from './readState.js'
import { WrappedProgram } from './wrappedProgram.js'
import { CONSTANT_NAMES } from './constrant.js'

//loads text files and calls callback with an object like this:
// { filename: 'content', otherFilename, 'morecontent' }
//TODO: error conditions...
function loadTextFiles(filenames, onLoaded) {
  var loadedSoFar = 0;
  var results = {};
  for (var i = 0; i < filenames.length; ++i) {
    var filename = filenames[i];
    (function() {
      var name = filename;

      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (request.readyState === 4) { //if this reqest is done
          //add this file to the results object
          var text = request.responseText;
          results[name] = text;

          loadedSoFar += 1;
          if (loadedSoFar === filenames.length) { //if we've loaded all of the files
            onLoaded(results);
          }
        }
      }
      request.open('GET', name, true);
      request.send();

    }());
  }
};

/*
input:
{
    firstProgram: {
        vertexShader: 'first.vert',
        fragmentShader: 'first.frag',
        attributeLocations: {
            0: 'a_attribute'
        }
    },

    secondProgram: {
        vertexShader: 'second.vert',
        fragmentShader: 'second.frag',
        attributeLocations: {
            0: 'a_attribute'
        }
    }
}

output:
{
    firstProgram: firstProgramObject,
    secondProgram: secondProgramObject
*/

function keysInObject(object) {
  var count = 0;
  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      count += 1;
    }
  }
  return count;
}

class WrappedGL {

  constructor(canvas, options) {
    var gl = this.gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);

    for (var i = 0; i < CONSTANT_NAMES.length; i += 1) {
      this[CONSTANT_NAMES[i]] = gl[CONSTANT_NAMES[i]];
    };

    this.changedParameters = {}; //parameters that aren't default

    //each parameter is an object like
    /*
    {
        defaults: [values],
        setter: function (called with this set to gl)

        //undefined flag means not used
        usedInDraw: whether this state matters for drawing
        usedInClear: whether this state matters for clearing
        usedInRead: wheter this state matters for reading
    }

    //the number of parameters in each defaults array corresponds to the arity of the corresponding setter
    */

    this.parameters = {
      'framebuffer': {
        defaults: [null],
        setter: function(framebuffer) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        },
        usedInDraw: true,
        usedInClear: true,
        usedInRead: true
      },
      'program': {
        defaults: [{ program: null }],
        setter: function(wrappedProgram) {
          gl.useProgram(wrappedProgram.program);
        },
        usedInDraw: true
      },
      'viewport': {
        defaults: [0, 0, 0, 0],
        setter: gl.viewport,
        usedInDraw: true
      },
      'indexBuffer': {
        defaults: [null],
        setter: function(buffer) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        },
        usedInDraw: true
      },
      'depthTest': {
        defaults: [false],
        setter: function(enabled) {
          if (enabled) {
            gl.enable(gl.DEPTH_TEST);
          } else {
            gl.disable(gl.DEPTH_TEST);
          }
        },
        usedInDraw: true
      },
      'depthFunc': {
        defaults: [gl.LESS],
        setter: gl.depthFunc,
        usedInDraw: true
      },
      'cullFace': {
        defaults: [false],
        setter: function(enabled) {
          if (enabled) {
            gl.enable(gl.CULL_FACE);
          } else {
            gl.disable(gl.CULL_FACE);
          }
        },
        usedInDraw: true
      },
      'frontFace': {
        defaults: [gl.CCW],
        setter: gl.frontFace
      },
      'blend': {
        defaults: [false],
        setter: function(enabled) {
          if (enabled) {
            gl.enable(gl.BLEND);
          } else {
            gl.disable(gl.BLEND);
          }
        },
        usedInDraw: true
      },
      'blendEquation': {
        defaults: [gl.FUNC_ADD, gl.FUNC_ADD],
        setter: gl.blendEquationSeparate,
        usedInDraw: true
      },
      'blendFunc': {
        defaults: [gl.ONE, gl.ZERO, gl.ONE, gl.ZERO],
        setter: gl.blendFuncSeparate,
        usedInDraw: true
      },
      'polygonOffsetFill': {
        defaults: [false],
        setter: function(enabled) {
          if (enabled) {
            gl.enable(gl.POLYGON_OFFSET_FILL);
          } else {
            gl.disable(gl.POLYGON_OFFSET_FILL);
          }
        },
        usedInDraw: true
      },
      'polygonOffset': {
        defaults: [0, 0],
        setter: gl.polygonOffset,
        usedInDraw: true
      },
      'scissorTest': {
        defaults: [false],
        setter: function(enabled) {
          if (enabled) {
            gl.enable(gl.SCISSOR_TEST);
          } else {
            gl.disable(gl.SCISSOR_TEST);
          }
        },
        usedInDraw: true,
        usedInClear: true
      },
      'scissor': {
        defaults: [0, 0, 0, 0],
        setter: gl.scissor,
        usedInDraw: true,
        usedInClear: true
      },
      'colorMask': {
        defaults: [true, true, true, true],
        setter: gl.colorMask,
        usedInDraw: true,
        usedInClear: true
      },
      'depthMask': {
        defaults: [true],
        setter: gl.depthMask,
        usedInDraw: true,
        usedInClear: true
      },
      'clearColor': {
        defaults: [0, 0, 0, 0],
        setter: gl.clearColor,
        usedInClear: true
      },
      'clearDepth': {
        defaults: [1],
        setter: gl.clearDepth,
        usedInClear: true
      }
    };


    var maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    for (var i = 0; i < maxVertexAttributes; ++i) {
      //we need to capture the index in a closure
      this.parameters['attributeArray' + i.toString()] = {
        defaults: [null, 0, null, false, 0, 0],
        setter: (function() {
          var index = i;

          return function(buffer, size, type, normalized, stride, offset) {
            if (buffer !== null) {
              gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
              gl.vertexAttribPointer(index, size, type, normalized, stride, offset);

              gl.enableVertexAttribArray(index); //TODO: cache this
            }
          }
        }()),
        usedInDraw: true
      };
    }

    var maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    for (var i = 0; i < maxTextures; ++i) {
      this.parameters['texture' + i.toString()] = {
        defaults: [gl.TEXTURE_2D, null],
        setter: (function() {
          //we need to capture the unit in a closure
          var unit = i;

          return function(target, texture) {
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(target, texture);
          }
        }()),
        usedInDraw: true
      };
    }


    this.uniformSetters = {
      '1i': gl.uniform1i,
      '2i': gl.uniform2i,
      '3i': gl.uniform3i,
      '4i': gl.uniform4i,
      '1f': gl.uniform1f,
      '2f': gl.uniform2f,
      '3f': gl.uniform3f,
      '4f': gl.uniform4f,
      '1fv': gl.uniform1fv,
      '2fv': gl.uniform2fv,
      '3fv': gl.uniform3fv,
      '4fv': gl.uniform4fv,
      'matrix2fv': gl.uniformMatrix2fv,
      'matrix3fv': gl.uniformMatrix3fv,
      'matrix4fv': gl.uniformMatrix4fv
    };


    this.defaultTextureUnit = 0; //the texure unit we use for modifying textures

  }

  static checkWebGLSupport(successCallback, failureCallback) {
    WrappedGL.checkWebGLSupportWithExtensions([], successCallback, function(hasWebGL, unsupportedExtensions) {
      failureCallback();
    });
  }

  //successCallback(), failureCallback(hasWebGL, unsupportedExtensions)
  static checkWebGLSupportWithExtensions(extensions, successCallback, failureCallback) {
    var canvas = document.createElement('canvas');
    var gl = null;
    try {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (e) {
      failureCallback(false, []); //no webgl support
      return;
    }
    if (gl === null) {
      failureCallback(false, []); //no webgl support
      return;
    }

    var unsupportedExtensions = [];
    for (var i = 0; i < extensions.length; ++i) {
      if (gl.getExtension(extensions[i]) === null) {
        unsupportedExtensions.push(extensions[i]);
      }
    }
    if (unsupportedExtensions.length > 0) {
      failureCallback(true, unsupportedExtensions); //webgl support but no extensions
      return;
    }

    //webgl support and all required extensions
    successCallback();
  };

  getSupportedExtensions() {
    return this.gl.getSupportedExtensions();
  };

  //returns null if the extension is not supported, otherwise the extension object
  getExtension(name) {
    var gl = this.gl;

    //for certain extensions, we need to expose additional, wrapped rendering compatible, methods directly on WrappedGL and DrawState
    if (name === 'ANGLE_instanced_arrays') {
      var instancedExt = gl.getExtension('ANGLE_instanced_arrays');

      if (instancedExt !== null) {
        this.instancedExt = instancedExt;

        var maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

        for (var i = 0; i < maxVertexAttributes; ++i) {
          this.parameters['attributeDivisor' + i.toString()] = {
            defaults: [0],
            setter: (function() {
              var index = i;

              return function(divisor) {
                instancedExt.vertexAttribDivisorANGLE(index, divisor);
              }
            }()),
            usedInDraw: true
          };
        }

        //override vertexAttribPointer
        DrawState.prototype.vertexAttribPointer = function(buffer, index, size, type, normalized, stride, offset) {
          this.setParameter('attributeArray' + index.toString(), [buffer, size, type, normalized, stride, offset]);

          if (this.changedParameters.hasOwnProperty('attributeDivisor' + index.toString())) {
            //we need to have divisor information for any attribute location that has a bound buffer
            this.setParameter('attributeDivisor' + index.toString(), [0]);
          }

          return this;
        };

        DrawState.prototype.vertexAttribDivisorANGLE = function(index, divisor) {
          this.setParameter('attributeDivisor' + index.toString(), [divisor]);
          return this;
        };

        this.drawArraysInstancedANGLE = function(drawState, mode, first, count, primcount) {
          this.resolveDrawState(drawState);

          this.instancedExt.drawArraysInstancedANGLE(mode, first, count, primcount);
        };

        this.drawElementsInstancedANGLE = function(drawState, mode, count, type, indices, primcount) {
          this.resolveDrawState(drawState);

          this.instancedExt.drawElementsInstancedANGLE(mode, count, type, indices, primcount);
        };

        return {};
      } else {
        return null;
      }

    } else { //all others, we can just return as is (we can treat them as simple enums)
      return gl.getExtension(name);
    }
  };

  //flag is one of usedInDraw, usedInClear, usedInRead
  resolveState(state, flag) {
    var gl = this.gl;


    //first let's revert all states to default that were set but now aren't set
    for (var parameterName in this.changedParameters) {
      if (this.changedParameters.hasOwnProperty(parameterName)) {
        if (!state.changedParameters.hasOwnProperty(parameterName)) { //if this is not set in the incoming draw state then we need to go back to default
          if (this.parameters[parameterName][flag]) {
            this.parameters[parameterName].setter.apply(this.gl, this.parameters[parameterName].defaults);

            delete this.changedParameters[parameterName];
          }
        }
      }
    }


    //now we set all of the new incoming states

    for (var parameterName in state.changedParameters) {
      if (state.changedParameters.hasOwnProperty(parameterName)) {

        if (!this.changedParameters.hasOwnProperty(parameterName) || //if this state is not currently set
          !arraysEqual(this.changedParameters[parameterName], state.changedParameters[parameterName]) //or if it's changed
        ) {

          this.changedParameters[parameterName] = state.changedParameters[parameterName];

          this.parameters[parameterName].setter.apply(this.gl, this.changedParameters[parameterName]);
        }
      }
    }
  }

  resolveDrawState(drawState) {
    var gl = this.gl;

    this.resolveState(drawState, 'usedInDraw');

    //resolve uniform values
    //we don't diff uniform values, it's just not worth it
    var program = drawState.changedParameters.program[0]; //we assume a draw state has a program

    for (var uniformName in drawState.uniforms) {
      if (drawState.uniforms.hasOwnProperty(uniformName)) {
        //this array creation is annoying....
        var args = [program.uniformLocations[uniformName]].concat(drawState.uniforms[uniformName].value);

        this.uniformSetters[drawState.uniforms[uniformName].type].apply(gl, args);
      }
    }

  }

  drawArrays(drawState, mode, first, count) {
    this.resolveDrawState(drawState);

    this.gl.drawArrays(mode, first, count);
  }

  drawElements(drawState, mode, count, type, offset) {
    this.resolveDrawState(drawState);

    this.gl.drawElements(mode, count, type, offset);
  }

  resolveClearState(clearState) {
    this.resolveState(clearState, 'usedInClear');
  }

  clear(clearState, bit) {
    this.resolveClearState(clearState);

    this.gl.clear(bit);
  }

  resolveReadState(readState) {
    this.resolveState(readState, 'usedInRead');
  }

  readPixels(readState, x, y, width, height, format, type, pixels) {
    this.resolveReadState(readState);

    this.gl.readPixels(x, y, width, height, format, type, pixels);
  }

  finish() {
    this.gl.finish();
    return this;
  }

  flush() {
    this.gl.flush();
    return this;
  }

  getError() {
    return this.gl.getError();
  }

  createFramebuffer() {
    return this.gl.createFramebuffer();
  }

  // 为帧缓冲区对象指定一张纹理
  framebufferTexture2D(framebuffer, target, attachment, textarget, texture, level) {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.changedParameters['framebuffer'] = framebuffer;

    this.gl.framebufferTexture2D(target, attachment, textarget, texture, level);

    return this;
  }

  // 为帧缓冲区绑定深度
  framebufferRenderbuffer(framebuffer, target, attachment, renderbuffertarget, renderbuffer) {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.changedParameters['framebuffer'] = framebuffer;

    this.gl.framebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer);
  }

  drawBuffers(framebuffer, buffers) {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.changedParameters['framebuffer'] = framebuffer;

    this.drawExt.drawBuffersWEBGL(buffers);
  }

  createTexture() {
    return this.gl.createTexture();
  }

  bindTextureForEditing(target, texture) {
    this.gl.activeTexture(this.gl.TEXTURE0 + this.defaultTextureUnit);
    this.gl.bindTexture(target, texture);

    this.changedParameters['texture' + this.defaultTextureUnit.toString()] = [target, texture];
  }

  //this function is overloaded, it can be either
  //(target, texture, level, internalformat, width, height, border, format, type, pixels)
  //(target, texture, level, internalformat, format, type, object)
  texImage2D(target, texture) {
    var args = Array.prototype.slice.call(arguments, 2);
    args.unshift(target); //add target to for texImage2D arguments list

    this.bindTextureForEditing(target, texture);
    this.gl.texImage2D.apply(this.gl, args);

    return this;
  }

  texParameteri(target, texture, pname, param) {
    this.bindTextureForEditing(target, texture);
    this.gl.texParameteri(target, pname, param);

    return this;
  }

  texParameterf(target, texture, pname, param) {
    this.bindTextureForEditing(target, texture);
    this.gl.texParameterf(target, pname, param);

    return this;
  }

  pixelStorei(target, texture, pname, param) {
    this.bindTextureForEditing(target, texture);
    this.gl.pixelStorei(pname, param);

    return this;
  }

  setTextureFiltering(target, texture, wrapS, wrapT, minFilter, magFilter) {
    var gl = this.gl;

    this.bindTextureForEditing(target, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);

    return this;
  }

  generateMipmap(target, texture) {
    this.bindTextureForEditing(target, texture);
    this.gl.generateMipmap(target);

    return this;
  }

  buildTexture(format, type, width, height, data, wrapS, wrapT, minFilter, magFilter) {
    var texture = this.createTexture();
    this.rebuildTexture(texture, format, type, width, height, data, wrapS, wrapT, minFilter, magFilter);

    return texture;
  }

  rebuildTexture(texture, format, type, width, height, data, wrapS, wrapT, minFilter, magFilter) {
    this.texImage2D(this.TEXTURE_2D, texture, 0, format, width, height, 0, format, type, data)
      .setTextureFiltering(this.TEXTURE_2D, texture, wrapS, wrapT, minFilter, magFilter);

    return this;
  }

  createRenderbuffer() {
    return this.gl.createRenderbuffer();
  }

  renderbufferStorage(renderbuffer, target, internalformat, width, height) {
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, renderbuffer);
    this.gl.renderbufferStorage(target, internalformat, width, height);

    return this;
  }

  createBuffer() {
    return this.gl.createBuffer();
  }

  bufferData(buffer, target, data, usage) {
    var gl = this.gl;

    if (target === gl.ARRAY_BUFFER) {
      //we don't really care about the vertex buffer binding state...
    } else if (target === gl.ELEMENT_ARRAY_BUFFER) {
      this.changedParameters.indexBuffer = [buffer];
    }

    gl.bindBuffer(target, buffer);
    gl.bufferData(target, data, usage);
  }

  bufferSubData(buffer, target, offset, data) {
    var gl = this.gl;

    if (target === gl.ARRAY_BUFFER) {
      //we don't really care about the vertex buffer binding state...
    } else if (target === gl.ELEMENT_ARRAY_BUFFER) {
      this.changedParameters.indexBuffer = [buffer];
    }

    gl.bindBuffer(target, buffer);
    gl.bufferSubData(target, offset, data);
  }

  createProgram(vertexShaderSource, fragmentShaderSource, attributeLocations) {
    return new WrappedProgram(this, vertexShaderSource, fragmentShaderSource, attributeLocations);
  }

  //asynchronous
  //successCallback is called with (program)
  //vertex shader, fragment shader can either be strings or arrays of strings
  //in the array case, the file contents will be concatenated
  createProgramFromFiles(vertexShaderPath, fragmentShaderPath, attributeLocations, successCallback, failureCallback) {
    var that = this;

    var filesToLoad = [];
    if (Array.isArray(vertexShaderPath)) {
      filesToLoad = filesToLoad.concat(vertexShaderPath);
    } else {
      filesToLoad.push(vertexShaderPath);
    }

    if (Array.isArray(fragmentShaderPath)) {
      filesToLoad = filesToLoad.concat(fragmentShaderPath);
    } else {
      filesToLoad.push(fragmentShaderPath);
    }

    loadTextFiles(filesToLoad, function(files) {
      var vertexShaderSources = [];
      if (Array.isArray(vertexShaderPath)) {
        for (var i = 0; i < vertexShaderPath.length; ++i) {
          vertexShaderSources.push(files[vertexShaderPath[i]]);
        }
      } else {
        vertexShaderSources.push(files[vertexShaderPath]);
      }


      var fragmentShaderSources = [];
      if (Array.isArray(fragmentShaderPath)) {
        for (var i = 0; i < fragmentShaderPath.length; ++i) {
          fragmentShaderSources.push(files[fragmentShaderPath[i]]);
        }
      } else {
        fragmentShaderSources.push(files[fragmentShaderPath]);
      }

      var program = that.createProgram(vertexShaderSources.join('\n'), fragmentShaderSources.join('\n'), attributeLocations);
      successCallback(program);
    });
  }

  //asynchronous
  createProgramsFromFiles(programParameters, successCallback, failureCallback) {
    var programCount = keysInObject(programParameters);

    var loadedSoFar = 0;
    var programs = {};
    for (var programName in programParameters) {
      if (programParameters.hasOwnProperty(programName)) {
        var parameters = programParameters[programName];

        var that = this;
        (function() {
          var name = programName;

          that.createProgramFromFiles(parameters.vertexShader, parameters.fragmentShader, parameters.attributeLocations, function(program) {
            programs[name] = program;

            loadedSoFar++;
            //if we've loaded all the programs
            if (loadedSoFar === programCount) {
              successCallback(programs);
            }

          });
        }());
      }
    }
  }

  createDrawState() {
    return new DrawState(this);
  }

  createClearState() {
    return new ClearState(this);
  };

  createReadState() {
    return new ReadState(this);
  }

  deleteBuffer(buffer) {
    this.gl.deleteBuffer(buffer);
  }

  deleteFramebuffer(buffer) {
    this.gl.deleteFramebuffer(buffer);
  }

  deleteTexture(texture) {
    this.gl.deleteTexture(texture);
  }
}

export { WrappedGL }
