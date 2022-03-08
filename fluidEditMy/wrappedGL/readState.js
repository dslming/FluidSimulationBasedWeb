import { State } from './state.js'

function ReadState(wgl) {
  State.call(this, wgl);
}

ReadState.prototype = Object.create(State.prototype);
ReadState.prototype.constructor = ReadState;

ReadState.prototype.bindFramebuffer = function(framebuffer) {
  this.setParameter('framebuffer', [framebuffer]);
  return this;
};

export { ReadState }
