//assumes a and b are equal length
export function arraysEqual(a, b) {
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

function State(wgl) {
  this.wgl = wgl;

  //all states that have been changed from defaults
  this.changedParameters = {};
  //map of state string to array of values
  //eg
  /*
      'framebuffer: [framebuffer],
      'viewport': [x, y, width, height],
      'blendMode': [rgb, alpha]
  */
};


State.prototype.setParameter = function(parameterName, values) {
  //if the state hasn't been set to the defaults
  if (!arraysEqual(values, this.wgl.parameters[parameterName].defaults)) {
    this.changedParameters[parameterName] = values;
  } else { //if we're going back to defaults
    if (this.changedParameters.hasOwnProperty(parameterName)) {
      delete this.changedParameters[parameterName];
    }
  }
};

State.prototype.clone = function() {
  var newState = new(this.constructor)(this.wgl);

  for (var parameterName in this.changedParameters) {
    if (this.changedParameters.hasOwnProperty(parameterName)) {
      var parameterValues = this.changedParameters[parameterName];
      var clonedValues = [];
      for (var i = 0; i < parameterValues.length; ++i) {
        clonedValues.push(parameterValues[i]);
      }
      newState.changedParameters[parameterName] = clonedValues;
    }
  }

  return newState;
}

export { State }
