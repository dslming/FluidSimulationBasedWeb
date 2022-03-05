
/**
 * Helping function (used for the scene and the main SPH program
 */

var camera = {};
var cameraTransformMatrix = mat4.create();
var down = false;

var eyeVector = vec3.create();
var upVector = vec3.create();
var rightVector = vec3.create();
var normalVector = vec3.create();
var yVector = vec3.create();

var prevMouseX = 0;
var prevMouseY = 0;
var currentMouseX = 0;
var currentMouseY = 0;

yVector[0] = 0;
yVector[1] = 1;
yVector[2] = 0;

//Camera
var alpha = 1.1494266478122668;
var beta = 0.6527531402458797;
var _alpha = alpha;
var _beta = beta;
var pMatrix = mat4.create();
var init = true;
var cameraVector;
var datGuiMove = false;
var currentFrame = 0;
var drag = false;
var movingCamera = false;

var camPos = [[1.2356931104119886, -0.7347836150896129],
               [0.7138396640656862, 0],
                [1.0821041362364856, 1.2374384396639815 ],
                [0.919043186549018, 2.413790355508154],
                [Math.PI * 0.5, 0]];

var currentCamera = 0;
var autoCamera = true;

//Init the canvas
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Sad world :(");
    }
}

//Camera events
function initCamera() {
    camera.position = vec3.create();
    camera.target = vec3.create(0.0, 0.0, 0.0);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mouseup', onMouseUp, false);
}

//Function that control de movement of the camera
function onMouseDown(event) {
    down = true;
    autoCamera = false;
}

function onMouseUp(event) {
    down = false;
    drag = false;
    movingCamera = false;
}

function onMouseMove(event) {
    currentMouseX = event.clientX;
    currentMouseY = event.clientY;
}

//Function to create fremabuffers
function setFramebuffer(texture) {
    var frameData = {};
    frameData.buffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameData.buffer);
    frameData.buffer.width = texture.size;
    frameData.buffer.height = texture.size;

    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, texture.size, texture.size);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return frameData;
}

//Function for texture creation
function createTexture(_textureSize, format, maxFilter, minFilter, type, unBind) {
    var texture = gl.createTexture();
    texture.size = _textureSize;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, _textureSize, _textureSize, 0, format, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, maxFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (unBind) gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
}

//Function for data buffers
function createBuffer(data) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return buffer;
}

//Simple 3D vector
function Vector3D(a, b, c) {
    this.x = a;
    this.y = b;
    this.z = c;
}

//box to place particles for the simulation
function box(size, center) {
    var pos = new Vector3D(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    return new Vector3D(pos.x * size.x + center.x, pos.y * size.y + center.y, pos.z * size.z + center.z);
}

//To avoid a non random distribution I use http://mathworld.wolfram.com/SpherePointPicking.html
function sphere(ratio, center) {
    var r = ratio * Math.pow(Math.random(), 1 / 3);
    var u = -1 + 2 * Math.random();
    var tetha = 1.9999 * Math.PI * Math.random();
    return new Vector3D(r * Math.sqrt(1 - u * u) * Math.cos(tetha) + center.x, r * u + center.y, r * Math.sqrt(1 - u * u) * Math.sin(tetha) + center.z);
}

//This function updates the camera position
function updateCamera() {
    if (down || init) {
        alpha -= 0.1 * (currentMouseY - prevMouseY) * Math.PI / 180;
        beta += 0.1 * (currentMouseX - prevMouseX) * Math.PI / 180;
        if (alpha <= 0) alpha = 0.001;
        if (alpha >= 1.05 *  Math.PI / 2) alpha = 1.05 * Math.PI / 2;
    }
    if ((_alpha != alpha || _beta != beta || init) && !datGuiMove && !drag) {
        _alpha += (alpha - _alpha) / 7;
        _beta += (beta - _beta) / 7;
        var cameraRatio = 4.;
        camera.target = [ 0.5, 0.5, 0.25 ];
        camera.position[0] = cameraRatio * Math.sin(_alpha) * Math.sin(_beta) + camera.target[0];
        camera.position[1] = cameraRatio * Math.cos(_alpha) + camera.target[1];
        camera.position[2] = cameraRatio * Math.sin(_alpha) * Math.cos(_beta) + camera.target[2];
        cameraTransformMatrix = defineTransformMatrix(camera.position, camera.target);
        cameraVector = [camera.position[0] - camera.target[0], camera.position[1] - camera.target[1], camera.position[2] - camera.target[2]];
        mat4.perspective(20, 1, 0.001, 6.0, pMatrix);
        init = false;
    }
    currentFrame++;
    prevMouseX = currentMouseX;
    prevMouseY = currentMouseY;

    if(currentFrame % 350. == 0 && autoCamera) {
        alpha = camPos[currentCamera][0];
        beta = camPos[currentCamera][1];
        currentCamera ++;
        if(currentCamera >= camPos.length) currentCamera = 0;
        vars.spherePos = 0.2 + 0.6 * Math.random();
        reset();
    }

    if(datGuiMove || drag) {
        alpha = _alpha;
        beta = _beta;
    }
}

//Transformation matrix function
function defineTransformMatrix(objectVector, targetVector) {
    var matrix = mat4.create();
    vec3.subtract(objectVector, targetVector, eyeVector);
    vec3.normalize(eyeVector, normalVector);
    var reference = vec3.dot(normalVector, yVector);
    var reference2 = vec3.create;
    vec3.scale(normalVector, reference, reference2);
    vec3.subtract(yVector, reference2, upVector);
    vec3.normalize(upVector, upVector);
    vec3.cross(normalVector, upVector, rightVector);
    matrix[0] = rightVector[0];
    matrix[1] = upVector[0];
    matrix[2] = normalVector[0];
    matrix[3] = 0;
    matrix[4] = rightVector[1];
    matrix[5] = upVector[1];
    matrix[6] = normalVector[1];
    matrix[7] = 0;
    matrix[8] = rightVector[2];
    matrix[9] = upVector[2];
    matrix[10] = normalVector[2];
    matrix[11] = 0;
    matrix[12] = -vec3.dot(objectVector, rightVector);
    matrix[13] = -vec3.dot(objectVector, upVector);
    matrix[14] = -vec3.dot(objectVector, normalVector);
    matrix[15] = 1;
    return matrix;
}