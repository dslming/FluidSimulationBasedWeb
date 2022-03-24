function loadTextFiles(filename) {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        var text = request.responseText;
        return resolve(text)
      }
    }
    request.open('GET', filename, true);
    request.send();
  })
};

window.shaderLib = {}

function loadShader(programs) {
  return new Promise((resolve, reject) => {
    let loadCount = 0;

    programs.forEach(async name => {
      window.shaderLib[name] = await loadTextFiles('./shaders/' + name + '.glsl');
      loadCount += 1;
      if (loadCount === programs.length) {
        resolve();
      }
    });
  })
}
