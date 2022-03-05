/*
 * SPH Simulation in Javascript
 */

var gl;
var canvas;
var ext;

var gridVolumeSize = 128;
var max = 1048576;
var windowSize;

//Textures
var tPosition;
var tVelDen;
var tCells1;
var tCells2;
var tCorners;
var tRead;
var tIndexes;
var tTriangles;
var tRender;
var tRender2;
var tCubeTexture;
var tDrag;

//Framebuffers
var fbPosition = {};
var fbVelocity = {};
var fbCells1 = {};
var fbCells2 = {};
var fbCorners = {};
var fbRead = {};
var fbIndexes = {};
var fbTriangles = {};
var fbRender = {};
var fbRender2 = {};
var fbDrag = {};

//Vertex Buffers
var vbIndex;
var vbPosition;
var vbVelocity;
var vb2DIndex;
var vb64Buffer;
var vbMC;
var vbCorners;

//For the simulation
var totalParticles;
var particleMass;
var maxSearchRatio;
var weightDefaultConstant;
var lambnaWeightDefaultConstant;
var weightPressureConstant;
var weightViscosityConstant;
var K_constant;
var viscosity;
var neighbords;
var n1;
var tempo = 0;

//Textures and Buffers for the histopyramid
var tPyramid = [];
var fbPyramid = [];
var activeCells = 0.;

//Triangle indexes (Paul Bourke tables)
var ti4 = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,3,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,3,1,8,1,9,-1,-1,-1,-1,-1,-1,10,1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,3,0,1,2,10,-1,-1,-1,-1,-1,-1,9,0,2,9,2,10,-1,-1,-1,-1,-1,-1,3,2,8,2,10,8,8,10,9,-1,-1,-1,11,2,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,11,2,0,11,0,8,-1,-1,-1,-1,-1,-1,11,2,3,0,1,9,-1,-1,-1,-1,-1,-1,2,1,11,1,9,11,11,9,8,-1,-1,-1,10,1,3,10,3,11,-1,-1,-1,-1,-1,-1,1,0,10,0,8,10,10,8,11,-1,-1,-1,0,3,9,3,11,9,9,11,10,-1,-1,-1,8,10,9,8,11,10,-1,-1,-1,-1,-1,-1,8,4,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,0,4,3,4,7,-1,-1,-1,-1,-1,-1,1,9,0,8,4,7,-1,-1,-1,-1,-1,-1,9,4,1,4,7,1,1,7,3,-1,-1,-1,10,1,2,8,4,7,-1,-1,-1,-1,-1,-1,2,10,1,0,4,7,0,7,3,-1,-1,-1,4,7,8,0,2,10,0,10,9,-1,-1,-1,2,7,3,2,9,7,7,9,4,2,10,9,2,3,11,7,8,4,-1,-1,-1,-1,-1,-1,7,11,4,11,2,4,4,2,0,-1,-1,-1,3,11,2,4,7,8,9,0,1,-1,-1,-1,2,7,11,2,1,7,1,4,7,1,9,4,8,4,7,11,10,1,11,1,3,-1,-1,-1,11,4,7,1,4,11,1,11,10,1,0,4,3,8,0,7,11,4,11,9,4,11,10,9,7,11,4,4,11,9,11,10,9,-1,-1,-1,9,5,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,0,8,4,9,5,-1,-1,-1,-1,-1,-1,5,4,0,5,0,1,-1,-1,-1,-1,-1,-1,4,8,5,8,3,5,5,3,1,-1,-1,-1,2,10,1,9,5,4,-1,-1,-1,-1,-1,-1,0,8,3,5,4,9,10,1,2,-1,-1,-1,10,5,2,5,4,2,2,4,0,-1,-1,-1,3,4,8,3,2,4,2,5,4,2,10,5,11,2,3,9,5,4,-1,-1,-1,-1,-1,-1,9,5,4,8,11,2,8,2,0,-1,-1,-1,3,11,2,1,5,4,1,4,0,-1,-1,-1,8,5,4,2,5,8,2,8,11,2,1,5,5,4,9,1,3,11,1,11,10,-1,-1,-1,0,9,1,4,8,5,8,10,5,8,11,10,3,4,0,3,10,4,4,10,5,3,11,10,4,8,5,5,8,10,8,11,10,-1,-1,-1,9,5,7,9,7,8,-1,-1,-1,-1,-1,-1,0,9,3,9,5,3,3,5,7,-1,-1,-1,8,0,7,0,1,7,7,1,5,-1,-1,-1,1,7,3,1,5,7,-1,-1,-1,-1,-1,-1,1,2,10,5,7,8,5,8,9,-1,-1,-1,9,1,0,10,5,2,5,3,2,5,7,3,5,2,10,8,2,5,8,5,7,8,0,2,10,5,2,2,5,3,5,7,3,-1,-1,-1,11,2,3,8,9,5,8,5,7,-1,-1,-1,9,2,0,9,7,2,2,7,11,9,5,7,0,3,8,2,1,11,1,7,11,1,5,7,2,1,11,11,1,7,1,5,7,-1,-1,-1,3,9,1,3,8,9,7,11,10,7,10,5,9,1,0,10,7,11,10,5,7,-1,-1,-1,3,8,0,7,10,5,7,11,10,-1,-1,-1,11,5,7,11,10,5,-1,-1,-1,-1,-1,-1,10,6,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,3,0,10,6,5,-1,-1,-1,-1,-1,-1,0,1,9,5,10,6,-1,-1,-1,-1,-1,-1,10,6,5,9,8,3,9,3,1,-1,-1,-1,1,2,6,1,6,5,-1,-1,-1,-1,-1,-1,0,8,3,2,6,5,2,5,1,-1,-1,-1,5,9,6,9,0,6,6,0,2,-1,-1,-1,9,6,5,3,6,9,3,9,8,3,2,6,3,11,2,10,6,5,-1,-1,-1,-1,-1,-1,6,5,10,2,0,8,2,8,11,-1,-1,-1,1,9,0,6,5,10,11,2,3,-1,-1,-1,1,10,2,5,9,6,9,11,6,9,8,11,11,6,3,6,5,3,3,5,1,-1,-1,-1,0,5,1,0,11,5,5,11,6,0,8,11,0,5,9,0,3,5,3,6,5,3,11,6,5,9,6,6,9,11,9,8,11,-1,-1,-1,10,6,5,4,7,8,-1,-1,-1,-1,-1,-1,5,10,6,7,3,0,7,0,4,-1,-1,-1,5,10,6,0,1,9,8,4,7,-1,-1,-1,4,5,9,6,7,10,7,1,10,7,3,1,7,8,4,5,1,2,5,2,6,-1,-1,-1,4,1,0,4,5,1,6,7,3,6,3,2,9,4,5,8,0,7,0,6,7,0,2,6,4,5,9,6,3,2,6,7,3,-1,-1,-1,7,8,4,2,3,11,10,6,5,-1,-1,-1,11,6,7,10,2,5,2,4,5,2,0,4,11,6,7,8,0,3,1,10,2,9,4,5,6,7,11,1,10,2,9,4,5,-1,-1,-1,6,7,11,4,5,8,5,3,8,5,1,3,6,7,11,4,1,0,4,5,1,-1,-1,-1,4,5,9,3,8,0,11,6,7,-1,-1,-1,9,4,5,7,11,6,-1,-1,-1,-1,-1,-1,10,6,4,10,4,9,-1,-1,-1,-1,-1,-1,8,3,0,9,10,6,9,6,4,-1,-1,-1,1,10,0,10,6,0,0,6,4,-1,-1,-1,8,6,4,8,1,6,6,1,10,8,3,1,9,1,4,1,2,4,4,2,6,-1,-1,-1,1,0,9,3,2,8,2,4,8,2,6,4,2,4,0,2,6,4,-1,-1,-1,-1,-1,-1,3,2,8,8,2,4,2,6,4,-1,-1,-1,2,3,11,6,4,9,6,9,10,-1,-1,-1,0,10,2,0,9,10,4,8,11,4,11,6,10,2,1,11,6,3,6,0,3,6,4,0,10,2,1,11,4,8,11,6,4,-1,-1,-1,1,4,9,11,4,1,11,1,3,11,6,4,0,9,1,4,11,6,4,8,11,-1,-1,-1,11,6,3,3,6,0,6,4,0,-1,-1,-1,8,6,4,8,11,6,-1,-1,-1,-1,-1,-1,6,7,10,7,8,10,10,8,9,-1,-1,-1,9,3,0,6,3,9,6,9,10,6,7,3,6,1,10,6,7,1,7,0,1,7,8,0,6,7,10,10,7,1,7,3,1,-1,-1,-1,7,2,6,7,9,2,2,9,1,7,8,9,1,0,9,3,6,7,3,2,6,-1,-1,-1,8,0,7,7,0,6,0,2,6,-1,-1,-1,2,7,3,2,6,7,-1,-1,-1,-1,-1,-1,7,11,6,3,8,2,8,10,2,8,9,10,11,6,7,10,0,9,10,2,0,-1,-1,-1,2,1,10,7,11,6,8,0,3,-1,-1,-1,1,10,2,6,7,11,-1,-1,-1,-1,-1,-1,7,11,6,3,9,1,3,8,9,-1,-1,-1,9,1,0,11,6,7,-1,-1,-1,-1,-1,-1,0,3,8,11,6,7,-1,-1,-1,-1,-1,-1,11,6,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,11,7,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,8,3,11,7,6,-1,-1,-1,-1,-1,-1,9,0,1,11,7,6,-1,-1,-1,-1,-1,-1,7,6,11,3,1,9,3,9,8,-1,-1,-1,1,2,10,6,11,7,-1,-1,-1,-1,-1,-1,2,10,1,7,6,11,8,3,0,-1,-1,-1,11,7,6,10,9,0,10,0,2,-1,-1,-1,7,6,11,3,2,8,8,2,10,8,10,9,2,3,7,2,7,6,-1,-1,-1,-1,-1,-1,8,7,0,7,6,0,0,6,2,-1,-1,-1,1,9,0,3,7,6,3,6,2,-1,-1,-1,7,6,2,7,2,9,2,1,9,7,9,8,6,10,7,10,1,7,7,1,3,-1,-1,-1,6,10,1,6,1,7,7,1,0,7,0,8,9,0,3,6,9,3,6,10,9,6,3,7,6,10,7,7,10,8,10,9,8,-1,-1,-1,8,4,6,8,6,11,-1,-1,-1,-1,-1,-1,11,3,6,3,0,6,6,0,4,-1,-1,-1,0,1,9,4,6,11,4,11,8,-1,-1,-1,1,9,4,11,1,4,11,3,1,11,4,6,10,1,2,11,8,4,11,4,6,-1,-1,-1,10,1,2,11,3,6,6,3,0,6,0,4,0,2,10,0,10,9,4,11,8,4,6,11,2,11,3,6,9,4,6,10,9,-1,-1,-1,3,8,2,8,4,2,2,4,6,-1,-1,-1,2,0,4,2,4,6,-1,-1,-1,-1,-1,-1,1,9,0,3,8,2,2,8,4,2,4,6,9,4,1,1,4,2,4,6,2,-1,-1,-1,8,4,6,8,6,1,6,10,1,8,1,3,1,0,10,10,0,6,0,4,6,-1,-1,-1,8,0,3,9,6,10,9,4,6,-1,-1,-1,10,4,6,10,9,4,-1,-1,-1,-1,-1,-1,9,5,4,7,6,11,-1,-1,-1,-1,-1,-1,4,9,5,3,0,8,11,7,6,-1,-1,-1,6,11,7,4,0,1,4,1,5,-1,-1,-1,6,11,7,4,8,5,5,8,3,5,3,1,6,11,7,1,2,10,9,5,4,-1,-1,-1,11,7,6,8,3,0,1,2,10,9,5,4,11,7,6,10,5,2,2,5,4,2,4,0,7,4,8,2,11,3,10,5,6,-1,-1,-1,4,9,5,6,2,3,6,3,7,-1,-1,-1,9,5,4,8,7,0,0,7,6,0,6,2,4,0,1,4,1,5,6,3,7,6,2,3,7,4,8,5,2,1,5,6,2,-1,-1,-1,4,9,5,6,10,7,7,10,1,7,1,3,5,6,10,0,9,1,8,7,4,-1,-1,-1,5,6,10,7,0,3,7,4,0,-1,-1,-1,10,5,6,4,8,7,-1,-1,-1,-1,-1,-1,5,6,9,6,11,9,9,11,8,-1,-1,-1,0,9,5,0,5,3,3,5,6,3,6,11,0,1,5,0,5,11,5,6,11,0,11,8,11,3,6,6,3,5,3,1,5,-1,-1,-1,1,2,10,5,6,9,9,6,11,9,11,8,1,0,9,6,10,5,11,3,2,-1,-1,-1,6,10,5,2,8,0,2,11,8,-1,-1,-1,3,2,11,10,5,6,-1,-1,-1,-1,-1,-1,9,5,6,3,9,6,3,8,9,3,6,2,5,6,9,9,6,0,6,2,0,-1,-1,-1,0,3,8,2,5,6,2,1,5,-1,-1,-1,1,6,2,1,5,6,-1,-1,-1,-1,-1,-1,10,5,6,9,3,8,9,1,3,-1,-1,-1,0,9,1,5,6,10,-1,-1,-1,-1,-1,-1,8,0,3,10,5,6,-1,-1,-1,-1,-1,-1,10,5,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,11,7,5,11,5,10,-1,-1,-1,-1,-1,-1,3,0,8,7,5,10,7,10,11,-1,-1,-1,9,0,1,10,11,7,10,7,5,-1,-1,-1,3,1,9,3,9,8,7,10,11,7,5,10,2,11,1,11,7,1,1,7,5,-1,-1,-1,0,8,3,2,11,1,1,11,7,1,7,5,9,0,2,9,2,7,2,11,7,9,7,5,11,3,2,8,5,9,8,7,5,-1,-1,-1,10,2,5,2,3,5,5,3,7,-1,-1,-1,5,10,2,8,5,2,8,7,5,8,2,0,9,0,1,10,2,5,5,2,3,5,3,7,1,10,2,5,8,7,5,9,8,-1,-1,-1,1,3,7,1,7,5,-1,-1,-1,-1,-1,-1,8,7,0,0,7,1,7,5,1,-1,-1,-1,0,3,9,9,3,5,3,7,5,-1,-1,-1,9,7,5,9,8,7,-1,-1,-1,-1,-1,-1,4,5,8,5,10,8,8,10,11,-1,-1,-1,3,0,4,3,4,10,4,5,10,3,10,11,0,1,9,4,5,8,8,5,10,8,10,11,5,9,4,1,11,3,1,10,11,-1,-1,-1,8,4,5,2,8,5,2,11,8,2,5,1,3,2,11,1,4,5,1,0,4,-1,-1,-1,9,4,5,8,2,11,8,0,2,-1,-1,-1,11,3,2,9,4,5,-1,-1,-1,-1,-1,-1,3,8,4,3,4,2,2,4,5,2,5,10,10,2,5,5,2,4,2,0,4,-1,-1,-1,0,3,8,5,9,4,10,2,1,-1,-1,-1,2,1,10,9,4,5,-1,-1,-1,-1,-1,-1,4,5,8,8,5,3,5,1,3,-1,-1,-1,5,0,4,5,1,0,-1,-1,-1,-1,-1,-1,3,8,0,4,5,9,-1,-1,-1,-1,-1,-1,9,4,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,4,11,4,9,11,11,9,10,-1,-1,-1,3,0,8,7,4,11,11,4,9,11,9,10,11,7,4,1,11,4,1,10,11,1,4,0,8,7,4,11,1,10,11,3,1,-1,-1,-1,2,11,7,2,7,1,1,7,4,1,4,9,3,2,11,4,8,7,9,1,0,-1,-1,-1,7,4,11,11,4,2,4,0,2,-1,-1,-1,2,11,3,7,4,8,-1,-1,-1,-1,-1,-1,2,3,7,2,7,9,7,4,9,2,9,10,4,8,7,0,10,2,0,9,10,-1,-1,-1,2,1,10,0,7,4,0,3,7,-1,-1,-1,10,2,1,8,7,4,-1,-1,-1,-1,-1,-1,9,1,4,4,1,7,1,3,7,-1,-1,-1,1,0,9,8,7,4,-1,-1,-1,-1,-1,-1,3,4,0,3,7,4,-1,-1,-1,-1,-1,-1,8,7,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,9,10,8,10,11,-1,-1,-1,-1,-1,-1,0,9,3,3,9,11,9,10,11,-1,-1,-1,1,10,0,0,10,8,10,11,8,-1,-1,-1,10,3,1,10,11,3,-1,-1,-1,-1,-1,-1,2,11,1,1,11,9,11,8,9,-1,-1,-1,11,3,2,0,9,1,-1,-1,-1,-1,-1,-1,11,0,2,11,8,0,-1,-1,-1,-1,-1,-1,11,3,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,8,2,2,8,10,8,9,10,-1,-1,-1,9,2,0,9,10,2,-1,-1,-1,-1,-1,-1,8,0,3,1,10,2,-1,-1,-1,-1,-1,-1,10,2,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,1,3,8,9,1,-1,-1,-1,-1,-1,-1,9,1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,0,3,-1,-1,-1,-1,-1,-1,-1,-1,-1];

//Corners for the lines of the outsideBox.
var cornersData = [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1];

//Variables for the sphere
var vbPosSphere;
var vbNormalSphere;
var vbTexSphere;
var vbIndexSphere;

//This function starts webGL

function setup() {

    canvas = document.getElementById("canvas3D");
    window.onresize = resize;
    resize(null);

    initGL(canvas);

    try {
        gl.getExtension('OES_texture_float');
    } catch (e) {
        alert("OES_texture_float extension not available");
    }

    tPosition = createTexture(1024., gl.RGBA, gl.NEAREST, gl.NEAREST, gl.FLOAT, true);
    tVelDen = createTexture(1024., gl.RGBA, gl.NEAREST, gl.NEAREST, gl.FLOAT, true);
    tCells1 = createTexture(1024., gl.RGBA, gl.NEAREST, gl.NEAREST, gl.FLOAT, true);
    tCells2 = createTexture(1024., gl.RGBA, gl.NEAREST, gl.NEAREST, gl.FLOAT, true);
    tCorners = createTexture(1024., gl.RGBA, gl.NEAREST, gl.NEAREST, gl.FLOAT, true);
    tTriangles = createTexture(1024., gl.RGBA, gl.NEAREST, gl.NEAREST, gl.FLOAT, true);
    tRender = createTexture(1024., gl.RGBA, gl.LINEAR, gl.LINEAR, gl.UNSIGNED_BYTE, true);
    tRender2 = createTexture(1024., gl.RGBA, gl.LINEAR, gl.LINEAR, gl.UNSIGNED_BYTE, true);
    tDrag = createTexture(1024., gl.RGBA, gl.LINEAR, gl.LINEAR, gl.UNSIGNED_BYTE, true);
    tIndexes = createTexture(64., gl.RGBA, gl.NEAREST, gl.NEAREST, gl.FLOAT, true);
    tRead = createTexture(1., gl.RGBA, gl.NEAREST, gl.NEAREST, gl.UNSIGNED_BYTE, true);

    fbPosition = setFramebuffer(tPosition);
    fbVelocity = setFramebuffer(tVelDen);
    fbCells1 = setFramebuffer(tCells1);
    fbCells2 = setFramebuffer(tCells2);
    fbCorners = setFramebuffer(tCorners);
    fbTriangles = setFramebuffer(tTriangles);
    fbRead = setFramebuffer(tRead);
    fbIndexes = setFramebuffer(tIndexes);
    fbRender = setFramebuffer(tRender);
    fbRender2 = setFramebuffer(tRender2);
    fbDrag = setFramebuffer(tDrag);

    var i, j, k;
    for (i = 0; i < 10; i++) {
        tPyramid.push(createTexture(Math.pow(2, 9 - i), gl.RGBA, gl.NEAREST, gl.NEAREST, gl.FLOAT, true));
        fbPyramid.push(setFramebuffer(tPyramid[i]));
    }

    //indexes for the neighbords...
    neighbords = [];
    var border = 1;
    for (k = -border; k <= border; k++) {
        for (j = -border; j <= border; j++) {
            for (i = -border; i <= border; i++) {
                neighbords.push(i, j, k);
            }
        }
    }

    var border = 2;
    for (k = -border; k <= border; k++) {
        for (j = -border; j <= border; j++) {
            for (i = -border; i <= border; i++) {
                if(Math.abs(i) == 2 || Math.abs(j) == 2 || Math.abs(k) == 2) neighbords.push(i, j, k);
            }
        }
    }

    initShaders();
    initCamera();

    //tCubeTexture = loadCubeMap();

    reset();

    //The triangles indexes is painted only once.
    updateVertices(fbIndexes.buffer, 13, ti4.length, 64, true, false);

    render();
}

function loadCubeMap() {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    var faces = [["cube04_0.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
        ["cube04_1.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
        ["cube04_2.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
        ["cube04_3.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
        ["cube04_4.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
        ["cube04_5.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
    for (var i = 0; i < faces.length; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.onload = function(texture, face, image) {
            return function() {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }
        } (texture, face, image);
        image.src = faces[i][0];
    }
    return texture;
}

//Resize function
function resize(e) {
    windowSize = window.innerHeight / window.innerWidth < 1 ? window.innerHeight : window.innerWidth;
    document.getElementById("container").style.width = windowSize;
    document.getElementById("container").style.left = (innerWidth - windowSize) * 0.5 - 163;
    document.getElementById("container").style.top = "0px";
    canvas.width = windowSize;
    canvas.height = windowSize;
    canvas.x = (innerWidth - windowSize) * 0.5 - 163;
    canvas.y = 0;
}

/*
 * Reset function for the particles
 */
function reset() {

    K_constant = vars.pressureK;
    maxSearchRatio = vars.maxSearchRatio / gridVolumeSize;
    weightDefaultConstant = 315 / (64 * Math.PI * Math.pow(maxSearchRatio, 9));
    weightPressureConstant = -45 / (Math.PI * Math.pow(maxSearchRatio, 6));
    weightViscosityConstant = 45 / (Math.PI * Math.pow(maxSearchRatio, 6));
    lambnaWeightDefaultConstant = -945 / (32 * Math.PI * Math.pow(maxSearchRatio, 9));

    initBuffers();
    initData(fbPosition.buffer, vbPosition, totalParticles, 1024);
    initData(fbVelocity.buffer, vbVelocity, totalParticles, 1024);
}

//Buffer init...
function initBuffers() {

    var arrayData = [];
    var i;

    //Index buffer
    for (i = 0; i < max; i++) arrayData.push(i);
    vbIndex = createBuffer(arrayData);
    arrayData.length = 0;
    var ratio = 0.1;
    totalParticles = vars.totalParticles;
    particleMass = 1000. * (4 * Math.PI * Math.pow(ratio, 3) / 3 +  0.15 * 0.6 * 0.6) / totalParticles;
    //particleMass = 1000. * 0.98 * 0.2 * 0.48 / totalParticles;
    n1 = Math.floor(4 * Math.PI * Math.pow(ratio, 3)  * 1000 / (3 * particleMass));
    //n1 = 0;
    particleMass *= vars.mass;
    var xPos = currentFrame == 0? 0.5 : 0.2 + 0.6 * Math.random();
    //Position Buffer
    var pos;
    for (i = 0; i < max; i++) {
        if(i <= n1) pos = sphere(ratio, new Vector3D(xPos, 0.85, 0.25));
        //else pos = box(new Vector3D(0.6, 0.05, 0.6), new Vector3D(0.5, 0.025, 0.5));
        else  pos = box(new Vector3D(0.2, 0.98, 0.48), new Vector3D(0.13, 0.5, 0.25));
        arrayData.push(pos.x, pos.y, pos.z);
    }
    vbPosition = createBuffer(arrayData);
    arrayData.length = 0;

    //Velocity Buffer
    for (i = 0; i < max; i++) {
        if(i <= n1) arrayData.push(0, 0, 0.);
        else arrayData.push(0, 0, 0);
        arrayData.push(0, 0, 0);
    }
    vbVelocity = createBuffer(arrayData);
    arrayData.length = 0;

    //2D Index Buffer
    var div = 0.0009765625;
    for(i = 0; i < max; i ++) arrayData.push(div * ((i % 1024.) + 0.5), div * (Math.floor(i * div) + 0.5));
    vb2DIndex = createBuffer(arrayData);
    arrayData.length = 0;

    //These buffers are used to create the texture for the indexes of the triangles
    div = 1 / 64.;
    for(i = 0; i < 4096; i++) arrayData.push(2. * div * ((i % 64) + 0.5) - 1, 2. * div * (Math.floor(i * div) + 0.5) - 1);
    vb64Buffer = createBuffer(arrayData);
    arrayData.length = 0.;

    vbMC = createBuffer(ti4);

    //Corners of the box
    vbCorners = createBuffer(cornersData);
    arrayData.length = 0;

    //For the sphere
    var latitudeBands = 20;
    var longitudeBands = 20;
    var radius = 0.2;

    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = 0.65 * latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);

            normalData.push(x - vars.spherePos);
            normalData.push(y - 0.2);
            normalData.push(z -  0.25);
            textureCoordData.push(u);
            textureCoordData.push(v);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y + 0.1);
            vertexPositionData.push(radius * z + 0.25);
        }
    }

    var indexData = [];
    for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    vbNormalSphere = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbNormalSphere);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    vbNormalSphere.itemSize = 3;
    vbNormalSphere.numItems = normalData.length / 3;

    vbTexSphere = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbTexSphere);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    vbTexSphere.itemSize = 2;
    vbTexSphere.numItems = textureCoordData.length / 2;

    vbPosSphere = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbPosSphere);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    vbPosSphere.itemSize = 3;
    vbPosSphere.numItems = vertexPositionData.length / 3;

    vbIndexSphere = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbIndexSphere);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    vbIndexSphere.itemSize = 1;
    vbIndexSphere.numItems = indexData.length;
}

/*
 *  Main rendering function for the simulation and rendering
 */
function render() {

    requestAnimFrame(render);

    /*
     * This is the simulation process, here is where the velocity
     * and position for the particles are updated
     * updateVertices(buffer, shader, numParticles, size, clear, add)
     * */

    //Obtain the median of the position and velocity for each cell
    setMedian(fbCells1.buffer, tPosition, totalParticles, 1024, 1);
    setMedian(fbCells2.buffer, tVelDen, totalParticles, 1024, 0);

    //Obtain the density for each particle
    updateVertices(fbVelocity.buffer, 2, totalParticles, 1024, false, true);

    //Calculate the median of the density for each cell
    updateVertices(fbCells2.buffer, 3, totalParticles, 1024, false, true);

    //Update the velocity of the particles
    updateVertices(fbTriangles.buffer, 4, totalParticles, 1024, false, false);
    evalTexture(tTriangles, 1024, fbVelocity.buffer);

    //Update the position of the particles
    updateVertices(fbTriangles.buffer, 18, totalParticles, 1024, false, false);
    evalTexture(tTriangles, 1024, fbPosition.buffer);

    /*
    This is the rendering part, here there are two choices, one is to render
    the particles as point sprites, the other is to use marching cubes to
    create a mesh.
     */

    if(vars.renderAsParticles) {

        //Render the particles as sprites
        updateVertices(null, 5, totalParticles, windowSize, true, true);

        setShader(20);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbIndexSphere);
        gl.drawElements(gl.LINES, vbIndexSphere.numItems, gl.UNSIGNED_SHORT, 0);

        setShader(19);
        gl.drawArrays(gl.LINES, 0, 24);
        gl.disable(gl.DEPTH_TEST);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbDrag.buffer);
        gl.clearColor(0, 0, 0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, 1024., 1024.);

    } else {

        //Evaluate the active cells in the 3d texture.
        updateVertices(fbCells1.buffer, 7, totalParticles, 1024, true, false);

        //Spread the size of the particle in the z planes for the texture3D
        if (vars.spreadZ) {
            drawQuad(fbCells2.buffer, 22, 1024);
            evalTexture(tCells2, 1024, fbCells1.buffer);
        }

        //Spread the cells around the neighbors
        spreadCells(vars.spread);

        //Evaluate the corners values in the potential field.
        drawQuad(fbCorners.buffer, 16, 1024);

        //Evaluate the cells active for the marching cubes
        drawQuad(fbCells2.buffer, 9, 1024);

        //Create the histo pyramid for the potential in the 1024 texture.
        createPyramid(tCells2);

        //Compact the cell data.
        updateVertices(fbCells1.buffer, 12, activeCells, 1024, true, false);

        //Create the triangles.
        updateVertices(fbTriangles.buffer, 14, Math.min(activeCells * 12, 3 * Math.floor(max / 3)), 1024, true, false);

        //Render all the objects in one texture
        renderObjects();

        //2D blur composition
        for (var i = 0; i < vars.finalBlur; i++) blur2D();

        //Brigtness and contrast.
        drawQuad(fbRender2.buffer, 21, 1024);

        if (vars.interactive) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbDrag.buffer);
            gl.clearColor(0, 0, 0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.viewport(0, 0, 1024., 1024.);

            setShader(20);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbIndexSphere);
            gl.drawElements(gl.TRIANGLES, vbIndexSphere.numItems, gl.UNSIGNED_SHORT, 0);

            var pixels = new Uint8Array(4);
            gl.readPixels((currentMouseX - canvas.x) * 1024 / windowSize, (canvas.height - currentMouseY ) * 1024 / windowSize, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            var active = pixels[0] * 256 * 256 + pixels[1] * 256 + pixels[2];
            if (active > 0 || drag) {
                document.getElementById("container").style.cursor = "pointer";
                if (down) {
                    drag = true;
                    var deltaX = -0.001 * ((currentMouseX - prevMouseX) * Math.cos(beta) - (currentMouseY - prevMouseY) * Math.sin(beta));
                    vars.spherePos += deltaX;
                    vars.spherePos = Math.max(Math.min(vars.spherePos, 0.8), 0.2);
                }
                else drag = false;
            }
            else {
                document.getElementById("container").style.cursor = "default";
            }
        }

        //Render the result on screen
        evalTexture(tRender2, windowSize);
    }

    //Calculate the position of the camera based on the mouse movement.
    updateCamera();
}

//This function updates the valueÂ´s particles
function updateVertices(buffer, shaderNumber, numVertex, size, clear, add) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
    if (clear) {
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    }
    gl.viewport(0, 0, size, size);
    if(add) {
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
    }
    setShader(shaderNumber);
    gl.drawArrays(gl.POINTS, 0, numVertex);
    if(add) gl.disable(gl.BLEND);
}

//This function renders a quad to apply fragment shaders calculations to textures.
function drawQuad(buffer, shaderNumber, size) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
    gl.viewport(0, 0, size, size);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    setShader(shaderNumber);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

//Position and Velocity initiation function.
function evalTexture(texture, size, buffer) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
    gl.viewport(0, 0, size, size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    printTexture(texture, 6);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

//Blur the cells to spread the values for the final potentials two times
function spreadCells(n) {

    var double = Math.floor(n * 0.5);
    var simple = (n == 1) ? 1 : n % 2;
    var i;
    var k = 0.0009765625;

    for(i = 0; i < double; i++) {
        blurKernel(fbCells2.buffer, tCells1, [128, 0], 17);
        blurKernel(fbCells1.buffer, tCells2, [k, 0, k], 8);
        blurKernel(fbCells2.buffer, tCells1, [0, k, k], 8);
        blurKernel(fbCells1.buffer, tCells2, [128, 0], 17);
        blurKernel(fbCells2.buffer, tCells1, [k, 0, k], 8);
        blurKernel(fbCells1.buffer, tCells2, [0, k, k], 8);
    }

    if(simple > 0) {
        blurKernel(fbCells2.buffer, tCells1, [128, 0], 17);
        blurKernel(fbCells1.buffer, tCells2, [k, 0, k], 8);
        blurKernel(fbCells2.buffer, tCells1, [0, k, k], 8);
        evalTexture(tCells2, 1024, fbCells1.buffer);
    }
}

//Function that makes an axis blur on a texture
function blurKernel(buffer, texture, axis, program) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
    gl.viewport(0, 0, 1024, 1024);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    setBlur(axis, texture, program);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

//This function create the histopyramid and obtains the activeCells in the texture
function createPyramid(initialTexture) {
    var sides = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
    for (var i = 0; i < 10; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbPyramid[i].buffer);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, sides[9 - i], sides[9 - i]);

        setPyramid(i == 0 ? initialTexture : tPyramid[i - 1], i);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    //This read the total cells used in the histopyramid
    drawQuad(fbRead.buffer, 11, 1);
    var pixels = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    activeCells = (pixels[0]  + pixels[1] / 255 + pixels[2] / 65025 + pixels[3] / 160581375);
    activeCells *= (1048576 / 255);
    activeCells = Math.round(activeCells);
}

//Render final blur
function blur2D() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbRender2.buffer);
    gl.viewport(0, 0, 1024, 1024);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    setBlur([0.0009765625, 0, 0.0009765625], tRender, 8);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbRender.buffer);
    gl.viewport(0, 0, 1024, 1024);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    setBlur([0, 0.0009765625, 0.0009765625], tRender2, 8);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

//Init the data of the particles
function initData(buffer, vertexBuffer, numVertex, size) {
    initSData(vertexBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, size, size);
    gl.drawArrays(gl.POINTS, 0, numVertex);
}

//This function sets the median of the particles in the cells.
function setMedian(buffer, texture, numVertex, size, alpha) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, size, size);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
    setSMedian(texture, alpha);
    gl.drawArrays(gl.POINTS, 0, numVertex);
    gl.disable(gl.BLEND);
}

//This function render all the objects to show in the screen on a texture (for postprocessing)
function renderObjects() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbRender.buffer);
    gl.clearColor(0, 0, 0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, 1024., 1024.);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    //Render the sphere
    setShader(20);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbIndexSphere);
    gl.drawElements(gl.TRIANGLES, vbIndexSphere.numItems, gl.UNSIGNED_SHORT, 0);

    //Render the container box
    setShader(19);
    gl.drawArrays(gl.LINES, 0, 24);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);

    //Render the triangles for the fluid mesh
    setShader(15);
    gl.drawArrays(gl.TRIANGLES, 0, Math.min(activeCells * 12, 3 * Math.floor(max / 3)));
    gl.disable(gl.CULL_FACE);

    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
}