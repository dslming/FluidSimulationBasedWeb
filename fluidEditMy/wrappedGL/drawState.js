import { State } from './state.js'

//inherits from State
function DrawState(wgl) {
  State.call(this, wgl);

  //we always set uniforms
  this.uniforms = {}; //eg: {type: '3f', value: [x, y, z]}
}

DrawState.prototype = Object.create(State.prototype);
DrawState.prototype.constructor = State;


DrawState.prototype.bindFramebuffer = function(framebuffer) {
  this.setParameter('framebuffer', [framebuffer]);
  return this;
};

DrawState.prototype.viewport = function(x, y, width, height) {
  this.setParameter('viewport', [x, y, width, height]);
  return this;
};

DrawState.prototype.enable = function(cap) {
  if (cap === this.wgl.DEPTH_TEST) {
    this.setParameter('depthTest', [true]);
  } else if (cap === this.wgl.BLEND) {
    this.setParameter('blend', [true]);
  } else if (cap === this.wgl.CULL_FACE) {
    this.setParameter('cullFace', [true]);
  } else if (cap === this.wgl.POLYGON_OFFSET_FILL) {
    this.setParameter('polygonOffsetFill', [true]);
  } else if (cap === this.wgl.SCISSOR_TEST) {
    this.setParameter('scissorTest', [true]);
  }

  return this;
};

DrawState.prototype.disable = function(cap) {
  if (cap === this.wgl.DEPTH_TEST) {
    this.setParameter('depthTest', [false]);
  } else if (cap === this.wgl.BLEND) {
    this.setParameter('blend', [false]);
  } else if (cap === this.wgl.CULL_FACE) {
    this.setParameter('cullFace', [false]);
  } else if (cap === this.wgl.POLYGON_OFFSET_FILL) {
    this.setParameter('polygonOffsetFill', [false]);
  } else if (cap === this.wgl.SCISSOR_TEST) {
    this.setParameter('scissorTest', [false]);
  }

  return this;
};

DrawState.prototype.vertexAttribPointer = function(buffer, index, size, type, normalized, stride, offset) {
  this.setParameter('attributeArray' + index.toString(), [buffer, size, type, normalized, stride, offset]);

  if (this.instancedExt && this.changedParameters.hasOwnProperty('attributeDivisor' + index.toString())) {
    //we need to have divisor information for any attribute location that has a bound buffer
    this.setParameter('attributeDivisor' + index.toString(), [0]);
  }

  return this;
};

DrawState.prototype.bindIndexBuffer = function(buffer) {
  this.setParameter('indexBuffer', [buffer]);
  return this;
};

DrawState.prototype.depthFunc = function(func) {
  this.setParameter('depthFunc', [func]);
  return this;
};

DrawState.prototype.frontFace = function(mode) {
  this.setParameter('frontFace', [mode]);
  return this;
};

DrawState.prototype.blendEquation = function(mode) {
  this.blendEquationSeparate(mode, mode);
  return this;
};

DrawState.prototype.blendEquationSeparate = function(modeRGB, modeAlpha) {
  this.setParameter('blendEquation', [modeRGB, modeAlpha]);

  return this;
};

DrawState.prototype.blendFunc = function(sFactor, dFactor) {
  this.blendFuncSeparate(sFactor, dFactor, sFactor, dFactor);
  return this;
};

DrawState.prototype.blendFuncSeparate = function(srcRGB, dstRGB, srcAlpha, dstAlpha) {
  this.setParameter('blendFunc', [srcRGB, dstRGB, srcAlpha, dstAlpha]);
  return this;
};

DrawState.prototype.scissor = function(x, y, width, height) {
  this.setParameter('scissor', [x, y, width, height]);
  return this;
};

DrawState.prototype.useProgram = function(program) {
  this.setParameter('program', [program]);
  return this;
};

DrawState.prototype.bindTexture = function(unit, target, texture) {
  this.setParameter('texture' + unit.toString(), [target, texture]);
  return this;
};

DrawState.prototype.colorMask = function(r, g, b, a) {
  this.setParameter('colorMask', [r, g, b, a]);
  return this;
};

DrawState.prototype.depthMask = function(enabled) {
  this.setParameter('depthMask', [enabled]);
  return this;
};

DrawState.prototype.polygonOffset = function(factor, units) {
  this.setParameter('polygonOffset', [factor, units]);
  return this;
};

DrawState.prototype.uniformTexture = function(uniformName, unit, target, texture) {
  this.uniform1i(uniformName, unit);
  this.bindTexture(unit, target, texture);

  return this;
};

DrawState.prototype.uniform1i = function(uniformName, value) {
  this.uniforms[uniformName] = { type: '1i', value: [value] };
  return this;
};

DrawState.prototype.uniform2i = function(uniformName, x, y) {
  this.uniforms[uniformName] = { type: '2i', value: [x, y] };
  return this;
};

DrawState.prototype.uniform3i = function(uniformName, x, y, z) {
  this.uniforms[uniformName] = { type: '3i', value: [x, y, z] };
  return this;
};

DrawState.prototype.uniform4i = function(uniformName, x, y, z, w) {
  this.uniforms[uniformName] = { type: '4i', value: [x, y, z, w] };
  return this;
};

DrawState.prototype.uniform1f = function(uniformName, value) {
  this.uniforms[uniformName] = { type: '1f', value: value };
  return this;
};

DrawState.prototype.uniform2f = function(uniformName, x, y) {
  this.uniforms[uniformName] = { type: '2f', value: [x, y] };
  return this;
};

DrawState.prototype.uniform3f = function(uniformName, x, y, z) {
  this.uniforms[uniformName] = { type: '3f', value: [x, y, z] };
  return this;
};

DrawState.prototype.uniform4f = function(uniformName, x, y, z, w) {
  this.uniforms[uniformName] = { type: '4f', value: [x, y, z, w] };
  return this;
};

DrawState.prototype.uniform1fv = function(uniformName, value) {
  this.uniforms[uniformName] = { type: '1fv', value: [value] };
  return this;
};

DrawState.prototype.uniform2fv = function(uniformName, value) {
  this.uniforms[uniformName] = { type: '2fv', value: [value] };
  return this;
};

DrawState.prototype.uniform3fv = function(uniformName, value) {
  this.uniforms[uniformName] = { type: '3fv', value: [value] };
  return this;
};

DrawState.prototype.uniform4fv = function(uniformName, value) {
  this.uniforms[uniformName] = { type: '4fv', value: [value] };
  return this;
};

DrawState.prototype.uniformMatrix2fv = function(uniformName, transpose, matrix) {
  this.uniforms[uniformName] = { type: 'matrix2fv', value: [transpose, matrix] };
  return this;
};

DrawState.prototype.uniformMatrix3fv = function(uniformName, transpose, matrix) {
  this.uniforms[uniformName] = { type: 'matrix3fv', value: [transpose, matrix] };
  return this;
};

DrawState.prototype.uniformMatrix4fv = function(uniformName, transpose, matrix) {
  this.uniforms[uniformName] = { type: 'matrix4fv', value: [transpose, matrix] };
  return this;
};

export { DrawState }
