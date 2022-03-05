/**
 * This controls the dynamic properties of
 * the different shaders applied in the SPH.
 */
var shader = [];
function sVars() {
    this.spherePos = 0.5;
    this.totalParticles = 100000;
    this.highPrecision = false;;
    this.mass = 1.6;
    this.pressureK = 7.;
    this.minPress = 0;
    this.viscosity = 7.;
    this.maxSearchRatio = 4.5;
    this.restitution = 1.0;
    this.dt = 0.004;
    this.particleSize = 3.;
    this.intensity = 0.1;
    this.spread = 2;
    this.range = 0.5;
    this.limit = 0.00001;
    this.finalBlur = 1;
    this.transparency = 0.6;
    this.renderAsParticles = false;
    this.spreadZ = false;
    this.brightness = 1.4;
    this.contrast = 2.3;
    this.interactive = true;
    this.restart = function() {
        reset();
    };
}

var vars = new sVars();

//Shader parser
function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

//Shader init
function initShaders() {

    /*
     * These are all the programs needed for the SPH
     * they are separated so each stage of the simulation
     * can use them.
     */

    var programs = [
        ["vs-initData", "fs-initData"],
        ["vs-index3D", "fs-medianData"],
        ["vs-index2D", "fs-density"],
        ["vs-index3D", "fs-mDensity"],
        ["vs-index2D", "fs-lagrange"],
        ["vs-renderParticles", "fs-simpleColor"],
        ["vs-simplePlane", "fs-setTexture"],
        ["vs-index3D", "fs-whiteColor"],
        ["vs-simplePlane", "fs-blur2D"],
        ["vs-simplePlane", "fs-marchCase"],
        ["vs-simplePlane", "fs-pyramid"],
        ["vs-simplePlane", "fs-pack"],
        ["vs-index2DPyramid", "fs-parsePyramid"],
        ["vs-triangleIndexes", "fs-simpleColor"],
        ["vs-index2DPyramid", "fs-triangleCreator"],
        ["vs-render", "fs-render"],
        ["vs-simplePlane", "fs-getCorners"],
        ["vs-simplePlane", "fs-blurZ"],
        ["vs-index2D", "fs-position"],
        ["vs-box", "fs-simpleColor"],
        ["vs-sphere", "fs-renderSphere"],
        ["vs-simplePlane", "fs-BrigtnessContrast"],
        ["vs-simplePlane", "fs-particleSizeZ"]
    ];

    for(var i = 0; i  < programs.length; i++) {
        var fragmentShader = getShader(gl, programs[i][0]);
        var vertexShader = getShader(gl, programs[i][1]);

        shader[i] = gl.createProgram();
        gl.attachShader(shader[i], vertexShader);
        gl.attachShader(shader[i], fragmentShader);
        gl.linkProgram(shader[i]);

        if (!gl.getProgramParameter(shader[i], gl.LINK_STATUS)) {
            alert("Could not init shaders in the program number: " + String(i));
        }
    }

    for(var i = 0; i < programs.length; i++) initShader(i);

    setupMenu();
}

//Function that starts and binds the buffers and uniforms for the shaders
function initShader(n) {
    switch (n) {
        case 0:
            shader[n].vertex2DIndex = gl.getAttribLocation(shader[n], "aV2I");
            gl.enableVertexAttribArray(shader[n].vertex2DIndex);
            shader[n].vertexData = gl.getAttribLocation(shader[n], "aVD");
            gl.enableVertexAttribArray(shader[n].vertexPosition);
            break;
        case 1:
            shader[n].vertex2DIndex = gl.getAttribLocation(shader[n], "aV2I");
            gl.enableVertexAttribArray(shader[n].vertex2DIndex);
            shader[n].positionTexture = gl.getUniformLocation(shader[n], "uPT");
            shader[n].dataTexture = gl.getUniformLocation(shader[n], "uDT");
            shader[n].alpha = gl.getUniformLocation(shader[n], "uAlpha");
            shader[n].particleSize = gl.getUniformLocation(shader[n], "uSize");
            break;
        case 2:
            shader[n].vertex2DIndex = gl.getAttribLocation(shader[n], "aV2I");
            gl.enableVertexAttribArray(shader[n].vertex2DIndex);
            shader[n].mass = gl.getUniformLocation(shader[n], "uMass");
            shader[n].searchRatio = gl.getUniformLocation(shader[n], "uMaxSearchRatio");
            shader[n].neighbords = gl.getUniformLocation(shader[n], "uNeighbords");
            shader[n].wDConstant = gl.getUniformLocation(shader[n], "uWeightDefaultConstant");
            shader[n].positionTexture = gl.getUniformLocation(shader[n], "uPT");
            shader[n].medianPositionTexture = gl.getUniformLocation(shader[n], "uMPT");
            shader[n].precision = gl.getUniformLocation(shader[n], "uHP");
            break;
        case 3:
            shader[n].vertex2DIndex = gl.getAttribLocation(shader[n], "aV2I");
            gl.enableVertexAttribArray(shader[n].vertex2DIndex);
            shader[n].positionTexture = gl.getUniformLocation(shader[n], "uPT");
            shader[n].densityTexture = gl.getUniformLocation(shader[n], "uDT");
            shader[n].particleSize = gl.getUniformLocation(shader[n], "uSize");
            break;
        case 4:
            shader[n].vertex2DIndex = gl.getAttribLocation(shader[n], "aV2I");
            gl.enableVertexAttribArray(shader[n].vertex2DIndex);
            shader[n].mass = gl.getUniformLocation(shader[n], "uMass");
            shader[n].searchRatio = gl.getUniformLocation(shader[n], "uMaxSearchRatio");
            shader[n].neighbords = gl.getUniformLocation(shader[n], "uNeighbords");
            shader[n].weightPressureConstant = gl.getUniformLocation(shader[n], "uWeightPressureConstant");
            shader[n].weightViscosityConstant = gl.getUniformLocation(shader[n], "uWeightViscosityConstant");
            shader[n].lambnaWeightDefaultConstant = gl.getUniformLocation(shader[n], "uLambnaWeightDefaultConstant");
            shader[n].k = gl.getUniformLocation(shader[n], "uK");
            shader[n].viscosity = gl.getUniformLocation(shader[n], "uViscosity");
            shader[n].dt = gl.getUniformLocation(shader[n], "uDeltaT");
            shader[n].cr = gl.getUniformLocation(shader[n], "uCr");
            shader[n].positionTexture = gl.getUniformLocation(shader[n], "uPT");
            shader[n].velocityTexture = gl.getUniformLocation(shader[n], "uVT");
            shader[n].medianVelocityTexture = gl.getUniformLocation(shader[n], "uMVT");
            shader[n].medianPositionTexture = gl.getUniformLocation(shader[n], "uMPT");
            shader[n].tempo = gl.getUniformLocation(shader[n], "uTime");
            shader[n].minPress = gl.getUniformLocation(shader[n], "uMinPress");
            shader[n].spherePos = gl.getUniformLocation(shader[n], "uX");
            shader[n].precision = gl.getUniformLocation(shader[n], "uHP");
            break;
        case 5:
            shader[n].vertex2DIndex = gl.getAttribLocation(shader[n], "aV2I");
            gl.enableVertexAttribArray(shader[n].vertex2DIndex);
            shader[n].intensity = gl.getUniformLocation(shader[n], "uIntensity");
            shader[n].particleSize = gl.getUniformLocation(shader[n], "uSize");
            shader[n].positionTexture = gl.getUniformLocation(shader[n], "uPT");
            shader[n].cameraMatrix = gl.getUniformLocation(shader[n], "uCameraMatrix");
            shader[n].pMatrix = gl.getUniformLocation(shader[n], "uPMatrix");
            break;
        case 6:
            shader[n].vertexIndex = gl.getAttribLocation(shader[n], "aVI");
            gl.enableVertexAttribArray(shader[n].vertexIndex);
            shader[n].dataTexture = gl.getUniformLocation(shader[n], "uDT");
            break;
        case 7:
            shader[n].vertex2DIndex = gl.getAttribLocation(shader[n], "aV2I");
            gl.enableVertexAttribArray(shader[n].vertex2DIndex);
            shader[n].positionTexture = gl.getUniformLocation(shader[n], "uPT");
            shader[n].particleSize = gl.getUniformLocation(shader[n], "uSize");
            break;
        case 8:
            shader[n].vertexIndex = gl.getAttribLocation(shader[n], "aVI");
            gl.enableVertexAttribArray(shader[n].vertexIndex);
            shader[n].dataTexture = gl.getUniformLocation(shader[n], "uDT");
            shader[n].axis = gl.getUniformLocation(shader[n], "uAxis");
            break;
        case 9:
            shader[n].vertexIndex = gl.getAttribLocation(shader[n], "aVI");
            gl.enableVertexAttribArray(shader[n].vertexIndex);
            shader[n].dataTexture = gl.getUniformLocation(shader[n], "uDT");
            shader[n].range = gl.getUniformLocation(shader[n], "uRange");
            break;
        case 10:
            shader[n].vertexIndex = gl.getAttribLocation(shader[n], "aVI");
            gl.enableVertexAttribArray(shader[n].vertexIndex);
            shader[n].potentialTexture = gl.getUniformLocation(shader[n], "uPyT");
            shader[n].size = gl.getUniformLocation(shader[n], "uSize");
            break;
        case 11:
            shader[n].vertexIndex = gl.getAttribLocation(shader[n], "aVI");
            gl.enableVertexAttribArray(shader[n].vertexIndex);
            shader[n].readPixelTexture = gl.getUniformLocation(shader[n], "uPyT");
            break;
        case 12:
            shader[n].vertexIndex = gl.getAttribLocation(shader[n], "aVI");
            gl.enableVertexAttribArray(shader[n].vertexIndex);
            shader[n].vertex2DIndex = gl.getAttribLocation(shader[n], "aV2I");
            gl.enableVertexAttribArray(shader[n].vertex2DIndex);
            shader[n].level0 = gl.getUniformLocation(shader[n], "uLev0");
            shader[n].level1 = gl.getUniformLocation(shader[n], "uLev1");
            shader[n].level2 = gl.getUniformLocation(shader[n], "uLev2");
            shader[n].level3 = gl.getUniformLocation(shader[n], "uLev3");
            shader[n].level4 = gl.getUniformLocation(shader[n], "uLev4");
            shader[n].level5 = gl.getUniformLocation(shader[n], "uLev5");
            shader[n].level6 = gl.getUniformLocation(shader[n], "uLev6");
            shader[n].level7 = gl.getUniformLocation(shader[n], "uLev7");
            shader[n].level8 = gl.getUniformLocation(shader[n], "uLev8");
            shader[n].level9 = gl.getUniformLocation(shader[n], "uLev9");
            break;
        case 13:
            shader[n].vertexIndex = gl.getAttribLocation(shader[n], "aVI");
            gl.enableVertexAttribArray(shader[n].vertexIndex);
            shader[n].vertex2DIndex = gl.getAttribLocation(shader[n], "aV2I");
            gl.enableVertexAttribArray(shader[n].vertex2DIndex);
            break;
        case 14:
            shader[n].vertexIndex = gl.getAttribLocation(shader[n], "aVI");
            gl.enableVertexAttribArray(shader[n].vertexIndex);
            shader[n].vertex2DIndex = gl.getAttribLocation(shader[n], "aV2I");
            gl.enableVertexAttribArray(shader[n].vertex2DIndex);
            shader[n].marchingTexture = gl.getUniformLocation(shader[n], "marchTex");
            shader[n].potentialTexture = gl.getUniformLocation(shader[n], "uPot");
            shader[n].tiTexture = gl.getUniformLocation(shader[n], "uTI");
            shader[n].range = gl.getUniformLocation(shader[n], "uRange");
            shader[n].limit = gl.getUniformLocation(shader[n], "uLimit");
            break;
        case 15:
            shader[n].vertex2D = gl.getAttribLocation(shader[n], "aV2I");
            gl.enableVertexAttribArray(shader[n].vertex2D);
            shader[n].cameraMatrix = gl.getUniformLocation(shader[n], "uCameraMatrix");
            shader[n].pMatrix = gl.getUniformLocation(shader[n], "uPMatrix");
            shader[n].positionTexture = gl.getUniformLocation(shader[n], "uPT");
            shader[n].transparency = gl.getUniformLocation(shader[n], "uTransparency");
            shader[n].eyeVector = gl.getUniformLocation(shader[n], "uEye");
            shader[n].ambient = gl.getUniformLocation(shader[n], "uCube");
            break;
        case 16:
            shader[n].vertexIndex = gl.getAttribLocation(shader[n], "aVI");
            gl.enableVertexAttribArray(shader[n].vertexIndex);
            shader[n].dataTexture = gl.getUniformLocation(shader[n], "uDT");
            break;
        case 17:
            shader[n].vertexIndex = gl.getAttribLocation(shader[n], "aVI");
            gl.enableVertexAttribArray(shader[n].vertexIndex);
            shader[n].dataTexture = gl.getUniformLocation(shader[n], "uDT");
            break;
        case 18:
            shader[n].vertex2DIndex = gl.getAttribLocation(shader[n], "aV2I");
            gl.enableVertexAttribArray(shader[n].vertex2DIndex);
            shader[n].positionTexture = gl.getUniformLocation(shader[n], "uPT");
            shader[n].velocityTexture = gl.getUniformLocation(shader[n], "uVT");
            shader[n].dt = gl.getUniformLocation(shader[n], "uDeltaT");
            shader[n].spherePos = gl.getUniformLocation(shader[n], "uX");
            break;
        case 19:
            shader[n].vertexPosition = gl.getAttribLocation(shader[n], "aPosition");
            gl.enableVertexAttribArray(shader[n].vertexPosition);
            shader[n].cameraMatrix = gl.getUniformLocation(shader[n], "uCameraMatrix");
            shader[n].pMatrix = gl.getUniformLocation(shader[n], "uPMatrix");
            break;
        case 20:
            shader[n].vertexPosition = gl.getAttribLocation(shader[n], "aPosition");
            gl.enableVertexAttribArray(shader[n].vertexPosition);
            shader[n].vertexNormal = gl.getAttribLocation(shader[n], "aNorm");
            gl.enableVertexAttribArray(shader[n].vertexNormal);
            shader[n].cameraMatrix = gl.getUniformLocation(shader[n], "uCameraMatrix");
            shader[n].pMatrix = gl.getUniformLocation(shader[n], "uPMatrix");
            shader[n].spherePos = gl.getUniformLocation(shader[n], "uX");
            shader[n].eyeVector = gl.getUniformLocation(shader[n], "uEye");
           // shader[n].ambient = gl.getUniformLocation(shader[n], "uCube");
            break;
        case 21:
            shader[n].vertexIndex = gl.getAttribLocation(shader[n], "aVI");
            gl.enableVertexAttribArray(shader[n].vertexIndex);
            shader[n].brightness = gl.getUniformLocation(shader[n], "uB");
            shader[n].contrast = gl.getUniformLocation(shader[n], "uC");
            shader[n].dataTexture = gl.getUniformLocation(shader[n], "uDT");
            break;
        case 22:
            shader[n].vertexIndex = gl.getAttribLocation(shader[n], "aVI");
            gl.enableVertexAttribArray(shader[n].vertexIndex);
            shader[n].dataTexture = gl.getUniformLocation(shader[n], "uDT");
            break;
    }
}

//Fucntion that sends the data to the shader used
function setShader(n) {

    gl.useProgram(shader[n]);

    switch(n) {
        case 2:
            gl.bindBuffer(gl.ARRAY_BUFFER, vb2DIndex);
            gl.vertexAttribPointer(shader[n].vertex2DIndex, 2, gl.FLOAT, false, 0, 0);
            gl.uniform1f(shader[n].mass, particleMass);
            gl.uniform1f(shader[n].searchRatio, maxSearchRatio);
            gl.uniform1f(shader[n].wDConstant, weightDefaultConstant);
            gl.uniform3fv(shader[n].neighbords, neighbords);
            gl.uniform1i(shader[n].precision, vars.highPrecision);
            bindTexture(shader[n].positionTexture, tPosition, 0);
            bindTexture(shader[n].medianPositionTexture, tCells1, 1);
            break;
        case 3:
            gl.bindBuffer(gl.ARRAY_BUFFER, vb2DIndex);
            gl.vertexAttribPointer(shader[n].vertex2DIndex, 2, gl.FLOAT, false, 0, 0);
            gl.uniform1f(shader[n].particleSize, 1);
            bindTexture(shader[n].positionTexture, tPosition, 0);
            bindTexture(shader[n].densityTexture, tVelDen, 1);
            break;
        case 4:
            gl.bindBuffer(gl.ARRAY_BUFFER, vb2DIndex);
            gl.vertexAttribPointer(shader[n].vertex2DIndex, 2, gl.FLOAT, false, 0, 0);
            gl.uniform1f(shader[n].mass, particleMass);
            gl.uniform1f(shader[n].searchRatio, maxSearchRatio);
            gl.uniform1f(shader[n].weightPressureConstant, weightPressureConstant);
            gl.uniform1f(shader[n].weightViscosityConstant, weightViscosityConstant);
            gl.uniform1f(shader[n].lambnaWeightDefaultConstant, lambnaWeightDefaultConstant);
            gl.uniform1f(shader[n].k, K_constant);
            gl.uniform1f(shader[n].viscosity, vars.viscosity);
            gl.uniform1f(shader[n].dt, vars.dt);
            gl.uniform1f(shader[n].cr, vars.restitution);
            gl.uniform3fv(shader[n].neighbords, neighbords);
            gl.uniform1f(shader[n].tempo, tempo);
            gl.uniform1f(shader[n].minPress, -vars.minPress);
            gl.uniform1f(shader[n].spherePos, vars.spherePos);
            gl.uniform1i(shader[n].precision, vars.highPrecision);
            bindTexture(shader[n].positionTexture, tPosition, 0);
            bindTexture(shader[n].velocityTexture, tVelDen, 1);
            bindTexture(shader[n].medianPositionTexture, tCells1, 2);
            bindTexture(shader[n].medianVelocityTexture, tCells2, 3);
            break;
        case 5:
            gl.bindBuffer(gl.ARRAY_BUFFER, vb2DIndex);
            gl.vertexAttribPointer(shader[n].vertex2DIndex, 2, gl.FLOAT, false, 0, 0);
            gl.uniform1f(shader[n].intensity, vars.intensity);
            gl.uniform1f(shader[n].particleSize, vars.particleSize);
            gl.uniformMatrix4fv(shader[n].cameraMatrix, false, cameraTransformMatrix);
            gl.uniformMatrix4fv(shader[n].pMatrix, false, pMatrix);
            gl.uniform1f(shader[n].tempo, tempo);
            bindTexture(shader[n].positionTexture, tPosition, 0);
            break;
        case 7:
            gl.bindBuffer(gl.ARRAY_BUFFER, vb2DIndex);
            gl.vertexAttribPointer(shader[n].vertex2DIndex, 2, gl.FLOAT, false, 0, 0);
            gl.uniform1f(shader[n].particleSize, vars.particleSize);
            bindTexture(shader[n].positionTexture, tPosition, 0);
            break;
        case 9:
            gl.bindBuffer(gl.ARRAY_BUFFER, vbIndex);
            gl.vertexAttribPointer(shader[n].vertexIndex, 1, gl.FLOAT, false, 0, 0);
            gl.uniform1f(shader[n].range, vars.range);
            bindTexture(shader[n].dataTexture, tCorners, 0);
            break;
        case 11:
            gl.bindBuffer(gl.ARRAY_BUFFER, vbIndex);
            gl.vertexAttribPointer(shader[n].vertexIndex, 1, gl.FLOAT, false, 0, 0);
            bindTexture(shader[n].readPixelTexture, tPyramid[9], 0);
            break;
        case 12:
            gl.bindBuffer(gl.ARRAY_BUFFER, vbIndex);
            gl.vertexAttribPointer(shader[n].vertexIndex, 1, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, vb2DIndex);
            gl.vertexAttribPointer(shader[n].vertex2DIndex, 2, gl.FLOAT, false, 0, 0);
            bindTexture(shader[n].level0, tPyramid[8], 0);
            bindTexture(shader[n].level1, tPyramid[7], 1);
            bindTexture(shader[n].level2, tPyramid[6], 2);
            bindTexture(shader[n].level3, tPyramid[5], 3);
            bindTexture(shader[n].level4, tPyramid[4], 4);
            bindTexture(shader[n].level5, tPyramid[3], 5);
            bindTexture(shader[n].level6, tPyramid[2], 6);
            bindTexture(shader[n].level7, tPyramid[1], 7);
            bindTexture(shader[n].level8, tPyramid[0], 8);
            bindTexture(shader[n].level9, tCells2, 9);
            break;
        case 13:
            gl.bindBuffer(gl.ARRAY_BUFFER, vbMC);
            gl.vertexAttribPointer(shader[n].vertexIndex, 1, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, vb64Buffer);
            gl.vertexAttribPointer(shader[n].vertex2DIndex, 2, gl.FLOAT, false, 0, 0);
            break;
        case 14:
            gl.bindBuffer(gl.ARRAY_BUFFER, vbIndex);
            gl.vertexAttribPointer(shader[n].vertexIndex, 1, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, vb2DIndex);
            gl.vertexAttribPointer(shader[n].vertex2DIndex, 2, gl.FLOAT, false, 0, 0);
            gl.uniform1f(shader[n].range, vars.range);
            gl.uniform1f(shader[n].limit, vars.limit);
            bindTexture(shader[n].marchingTexture, tCells1, 0);
            bindTexture(shader[n].tiTexture, tIndexes, 1);
            bindTexture(shader[n].potentialTexture, tCorners, 2);
            break;
        case 15:
            gl.bindBuffer(gl.ARRAY_BUFFER, vb2DIndex);
            gl.vertexAttribPointer(shader[n].vertex2DIndex, 2, gl.FLOAT, false, 0, 0);
            gl.uniformMatrix4fv(shader[n].cameraMatrix, false, cameraTransformMatrix);
            gl.uniformMatrix4fv(shader[n].pMatrix, false, pMatrix);
            gl.uniform1f(shader[n].transparency, vars.transparency);
            gl.uniform3fv(shader[n].eyeVector, [camera.target[0] - camera.position[0], camera.target[1] - camera.position[1], camera.target[2] - camera.position[2]]);
            bindTexture(shader[n].ambient, tCubeTexture, 0);
            bindTexture(shader[n].positionTexture, tTriangles, 1);

            break;
        case 16:
            gl.bindBuffer(gl.ARRAY_BUFFER, vbIndex);
            gl.vertexAttribPointer(shader[n].vertexIndex, 1, gl.FLOAT, false, 0, 0);
            bindTexture(shader[n].dataTexture, tCells1, 0);
            break;
        case 18:
            gl.bindBuffer(gl.ARRAY_BUFFER, vb2DIndex);
            gl.vertexAttribPointer(shader[n].vertex2DIndex, 2, gl.FLOAT, false, 0, 0);
            gl.uniform1f(shader[n].dt, vars.dt);
            gl.uniform1f(shader[n].spherePos, vars.spherePos);
            bindTexture(shader[n].positionTexture, tPosition, 0);
            bindTexture(shader[n].velocityTexture, tVelDen, 1);
            break;
        case 19:
            gl.bindBuffer(gl.ARRAY_BUFFER, vbCorners);
            gl.vertexAttribPointer(shader[n].vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.uniformMatrix4fv(shader[n].cameraMatrix, false, cameraTransformMatrix);
            gl.uniformMatrix4fv(shader[n].pMatrix, false, pMatrix);
            break;
        case 20:
            gl.bindBuffer(gl.ARRAY_BUFFER, vbPosSphere);
            gl.vertexAttribPointer(shader[n].vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, vbNormalSphere);
            gl.vertexAttribPointer(shader[n].vertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.uniform1f(shader[n].spherePos, vars.spherePos);
            gl.uniformMatrix4fv(shader[n].cameraMatrix, false, cameraTransformMatrix);
            gl.uniformMatrix4fv(shader[n].pMatrix, false, pMatrix);
            gl.uniform3fv(shader[n].eyeVector, [camera.target[0] - camera.position[0], camera.target[1] - camera.position[1], camera.target[2] - camera.position[2]]);
            break;
        case 21:
            gl.bindBuffer(gl.ARRAY_BUFFER, vbIndex);
            gl.vertexAttribPointer(shader[n].vertexIndex, 1, gl.FLOAT, false, 0, 0);
            gl.uniform1f(shader[n].brightness, vars.brightness);
            gl.uniform1f(shader[n].contrast, vars.contrast);
            bindTexture(shader[n].data, tRender, 0);
            break;
        case 22:
            gl.bindBuffer(gl.ARRAY_BUFFER, vbIndex);
            gl.vertexAttribPointer(shader[n].vertexIndex, 1, gl.FLOAT, false, 0, 0);
            bindTexture(shader[n].dataTexture, tCells1, 0);
            break;
    }
}

//Texture evaluation function
function printTexture(texture, n) {
    gl.useProgram(shader[n]);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbIndex);
    gl.vertexAttribPointer(shader[n].vertexIndex, 1, gl.FLOAT, false, 0, 0);
    bindTexture(shader[n].dataTexture, texture, 0);
}

//Blur function...
function setBlur(axis, data, n) {
    gl.useProgram(shader[n]);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbIndex);
    gl.vertexAttribPointer(shader[n].vertexIndex, 1, gl.FLOAT, false, 0, 0);
    if(n == 8) gl.uniform3fv(shader[n].axis, axis);
    bindTexture(shader[n].dataTexture, data, 0);
}

//pyramid creator
function setPyramid(texture, level) {
    if(level == 0) {
        gl.useProgram(shader[10]);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbIndex);
        gl.vertexAttribPointer(shader[10].vertexIndex, 1, gl.FLOAT, false, 0, 0);
    }
    var sides = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
    var size = sides[level + 1] / 1024;
    gl.uniform1f(shader[10].size, size);
    bindTexture(shader[10].potentialTexture, texture, 0);
}

//Init function of particle data
function initSData(vertexBuffer) {
    gl.useProgram(shader[0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, vb2DIndex);
    gl.vertexAttribPointer(shader[0].vertex2DIndex, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(shader[0].vertexData, 3, gl.FLOAT, false, 0, 0);
}

//Median function in the cells.
function setSMedian(texture, alpha) {
    gl.useProgram(shader[1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, vb2DIndex);
    gl.vertexAttribPointer(shader[1].vertex2DIndex, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(shader[1].particleSize, 1);
    gl.uniform1f(shader[1].alpha, alpha);
    bindTexture(shader[1].positionTexture, tPosition, 0);
    bindTexture(shader[1].dataTexture, texture, 1);
}

//shaderMenu
function setupMenu() {
    gui = new DAT.GUI(vars);
    gui.close();
    gui.add(vars, "restart");
    gui.add(vars, "totalParticles", 25000, 300000, 5000);
    gui.add(vars, "mass", 1, 5, 0.1).name("mass multiplier");
    gui.add(vars, "pressureK", 1, 10, 0.5).name("k constant");
    //gui.add(vars, "minPress", 0, 100, 1).name("min neg pressure");
    gui.add(vars, "viscosity", 1, 10, 0.1).name("viscosity term");
    //gui.add(vars, "restitution", 1, 1.5, 0.1).name("collision restitution");
    gui.add(vars, "dt", 0.0001, 0.01, 0.0005).name("time integrator");
    gui.add(vars, "particleSize", 1, 4, 1);
    gui.add(vars, "spread", 1, 6, 1);
    gui.add(vars, "range", 0.2, 1, 0.01);
    gui.add(vars, "transparency", 0, 1, 0.01).name("opacity");
    gui.add(vars, "brightness", 1, 5, 0.1);
    gui.add(vars, "contrast", 1, 3, 0.01);
    gui.add(vars, "finalBlur", 0, 3, 1);
    gui.add(vars, "spreadZ").name("Z spread");
    gui.add(vars, "interactive");
    gui.add(vars, "renderAsParticles").name("show simulation");
}

//This function binds the textures to the current shader
function bindTexture(programData, texture, texturePos) {
    var textures = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3, gl.TEXTURE4, gl.TEXTURE5, gl.TEXTURE6, gl.TEXTURE7, gl.TEXTURE8, gl.TEXTURE9, gl.TEXTURE10, gl.TEXTURE11, gl.TEXTURE12, gl.TEXTURE13, gl.TEXTURE14];
    gl.activeTexture(textures[texturePos]);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programData, texturePos);
}
