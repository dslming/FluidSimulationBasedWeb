import { State } from './state.js'

function ClearState(wgl) {
  State.call(this, wgl);
};

ClearState.prototype = Object.create(State.prototype);
ClearState.prototype.constructor = ClearState;

ClearState.prototype.bindFramebuffer = function(framebuffer) {
  this.setParameter('framebuffer', [framebuffer]);
  return this;
};

ClearState.prototype.clearColor = function(r, g, b, a) {
  this.setParameter('clearColor', [r, g, b, a]);
  return this;
};

ClearState.prototype.clearDepth = function(depth) {
  this.setParameter('clearDepth', [depth]);
  return this;
}

ClearState.prototype.colorMask = function(r, g, b, a) {
  this.setParameter('colorMask', [r, g, b, a]);
  return this;
};

ClearState.prototype.depthMask = function(enabled) {
  this.setParameter('depthMask', [enabled]);
  return this;
};
export { ClearState }
