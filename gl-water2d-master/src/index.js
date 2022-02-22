/* global requestAnimationFrame */
var glShader = require('gl-shader');
var glslify = require('glslify')
var shell = require("gl-now")({tickRate: 20});
var createGui = require("pnp-gui");
var mat4 = require("gl-mat4");
var vec3 = require("gl-vec3");

var createWater = require("./simulation.js");
var saveAs = require('filesaver.js').saveAs;

/*
These are used by the GUI
 */
var mouseLeftDownPrev = false;
var pressed;
var io;

/*
the water simulation.
 */
var water;

// global modes. Used by GUI.
const GM_LEVEL = 10;
const GM_LIQUID = 11;
var globalMode = {val: GM_LEVEL};

// edit modes. Used by GUI
const EM_REMOVE = 0;
const EM_ADD_CAPSULE = 1;
const EM_ADD_EMITTER = 2;
const EM_EDIT_EMITTER = 4;
var editMode = {val: EM_ADD_CAPSULE};

var editEmitter = null; // the emitter currently being edited.

var capsuleRadius = {val: 0.5}; // capsule radius of capsules that we add.


var recordingTime = {val: 5}; // for many seconds to record.
var isRecording = {val: false}; // whether we are recording.

var isRunningSimulation = {val: true}; // whether we are running the simulation.

var importMessage = "No Message";
var recordingMessage = "Not recording";

// amount of seconds between the update steps of the water simulation.
const updateRate = 0.02;



function hash(text) {

    var h = 5381;
    var index = text.length;

    while (index) {
        h = (h * 33) ^ text.charCodeAt(--index);
    }

    return h >>> 0;
}


function startRecord(gl, canvas) {

    water.reset();
    isRunningSimulation.val =  true;
    isRecording.val = true;
    var bytes = 1024*1024*1024*30; // 30GB should be good enough
    window.webkitStorageInfo.requestQuota(PERSISTENT, bytes, function (grantedBytes) {
        console.log('Got storage', grantedBytes);
        window.webkitRequestFileSystem(PERSISTENT, grantedBytes, function (fs) {

            window.fs = fs;
            console.log("Got filesystem");

            var totalTime  = 0.0;

            // we recursively call this function until we have recorded enough frames.
            function recordFrame() {

                var name = Math.random(); // File name doesn't matter
                fs.root.getFile(name, {create: true}, function (entry) {
                    entry.createWriter(function (writer) {

                        var min = water.getMinPos();
                        var max = water.getMaxPos();

                        // round
                        min = [Math.floor(min[0]), Math.floor(min[1])];
                        max = [Math.floor(max[0]), Math.floor(max[1])];

                        // compute dimensions.
                        var width = max[0] - min[0];
                        var height = max[1] - min[1];

                        // add padding so that the output image dimensions are even
                        // otherwise, we can't create a video with FFMPEG for some reason.
                        width += width % 2 == 0 ? 0 : 1;
                        height += height % 2 == 0 ? 0 : 1;

                        // update and render simulation
                        totalTime += updateRate;
                        water.update(canvas.width, canvas.height, shell.mouse, updateRate, isRunningSimulation.val);
                        water.draw(gl, editEmitter, isRecording.val);
                        gl.flush();
                        gl.finish();


                        // save framebuffer to our own buffer.
                        var bufferArray = new Uint8Array(width * height * 4);
                        gl.readPixels(min[0], min[1], width, height, gl.RGBA, gl.UNSIGNED_BYTE, bufferArray);

                        // now put the framebuffer pixels into a TGA file.
                        var buffer = new Uint8Array(18 + width * height * 3);
                        var j = 0;

                        // TGA header below. 
                        buffer[j++] = 0;
                        buffer[j++] = 0;
                        buffer[j++] = 2;
                        buffer[j++] = 0;
                        buffer[j++] = 0;
                        buffer[j++] = 0;
                        buffer[j++] = 0;

                        buffer[j++] = 0;
                        buffer[j++] = 0;
                        buffer[j++] = 0;
                        buffer[j++] = 0;
                        buffer[j++] = 0;
                        buffer[j++] = width & 0x00FF;
                        buffer[j++] = (width & 0xFF00) / 256;

                        buffer[j++] = height & 0x00FF;
                        buffer[j++] = (height & 0xFF00) / 256;
                        buffer[j++] = 24;
                        buffer[j++] = 0;

                        // after the header, put the pixel data.
                        for (var i = 0; i < width * height * 4; i += 4) {
                            buffer[j++] = bufferArray[i + 2];
                            buffer[j++] = bufferArray[i + 1];
                            buffer[j++] = bufferArray[i + 0];
                        }
                        
                        // Write data
                        var blob = new Blob([buffer], {type: 'image/bmp'});
                        writer.seek(0);
                        writer.write(blob);

                        if(totalTime < recordingTime.val && isRecording.val) {
                            recordFrame();
                            recordingMessage = "Recording: " +  totalTime.toFixed(1) + "/" + recordingTime.val;
                        }else {
                            console.log("DONE RECORDING");
                            recordingMessage = "Done recording";
                            isRecording.val = false;
                        }

                    });
                }, function () {
                    console.log('File error', arguments);
                });

            }

            // start recording.
            recordFrame();


        });
    }, function (e) {
        console.log('Storage error', e);
    });
}

shell.on("gl-init", function () {
    var gl = shell.gl;

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gui = new createGui(gl);
    gui.windowSizes = [340, 590];
    gui.windowAlpha = 1.0;
    gui.widgetSpacing = 9;  // decrease GUI spacing.

    water = new createWater(gl);



});



shell.on("tick", function () {
    var canvas = shell.canvas;


    if(!isRecording.val) // if we are recording, we are already updating the simulation in recordFrame()
        water.update(canvas.width, canvas.height, shell.mouse, updateRate, isRunningSimulation.val);
});

shell.on("gl-render", function (t) {
    var gl = shell.gl;
    var canvas = shell.canvas;

    water.draw(gl, editEmitter, isRecording.val);
    var levelData = water.getLevelData();

    /*
    Gather information needed by the GUI
     */
    pressed = shell.wasDown("mouse-left");
    io = {
        mouseLeftDownCur: pressed,
        mouseLeftDownPrev: mouseLeftDownPrev,

        mousePositionCur: shell.mouse,
        mousePositionPrev: shell.prevMouse
    };
    mouseLeftDownPrev = pressed;

    /*
    Create GUI
     */

    gui.begin(io, "Editor");


    gui.textLine("Global Edit Mode");

    gui.radioButton("Edit Level", globalMode, GM_LEVEL);
    gui.sameLine();
    gui.radioButton("Edit Liquid", globalMode, GM_LIQUID);
    gui.separator();

    if(globalMode.val == GM_LEVEL) {

        gui.textLine("Edit Level Mode");

        gui.radioButton("Remove Capsule/Emitter", editMode, EM_REMOVE);
        gui.sameLine();
        gui.radioButton("Add Capsule", editMode, EM_ADD_CAPSULE);
        gui.radioButton("Add Emitter", editMode, EM_ADD_EMITTER);
        gui.sameLine();
        gui.radioButton("Edit Emitter", editMode, EM_EDIT_EMITTER);

        gui.separator();

        gui.textLine("Edit Mode Settings");

        if (editMode.val == EM_ADD_CAPSULE) {
            gui.textLine("Right click to cancel");
            gui.sliderFloat("Capsule Radius", capsuleRadius, 0.2, 0.6);
        } else if (editMode.val == EM_EDIT_EMITTER) {

            if (editEmitter == null) {
                gui.textLine("Please select an emitter");
            } else {
                gui.textLine("Editing");

                gui.draggerRgb("Color", editEmitter.color);
                gui.sliderFloat("Frequency", editEmitter.frequency, 0.0, 40.0);
                gui.sliderInt("Angle", editEmitter.baseAngle, 0, 360);
                gui.sliderInt("Angle Velocity", editEmitter.angleVelocity, 0, 80);
                gui.sliderFloat("Strength", editEmitter.strength, 1, 15);
                gui.sliderInt("Velocity Randomness", editEmitter.velRand, 0, 30);
            }

        }
    } else {

        gui.textLine("Edit Liquid Mode");

        gui.sliderFloat("Sigma(Viscosity)", levelData.sigma, 0.0, 1.0);
        gui.sliderFloat("Beta(Viscosity)", levelData.beta, 0.0, 1.0);
        gui.sliderFloat("Gravity", levelData.gravity, 0.001, 0.1, 3);
        gui.sliderFloat("Rest Density", levelData.restDensity, 1.0, 30.0);
        gui.sliderFloat("Stiffness", levelData.stiffness, 0.0001, 0.03, 4 );
        gui.sliderFloat("Near Stiffness", levelData.nearStiffness, 0.00, 3.0);
    }

    gui.separator();

    if (gui.button("Reset Particles")) {
        water.reset();
    }
    gui.sameLine();
    gui.checkbox("Run simulation", isRunningSimulation);

    gui.checkbox("Limit Particle Count", water.isLimitParticles);

    if (water.isLimitParticles.val) {
        gui.sliderInt("Max Particles", water.maxParticles, 0, 10000);
    }

    gui.textLine("Particles: " +  water.getParticleCount() );

    gui.separator();

    if(isRecording.val) {
        if(gui.button("Stop recording")) {
            isRecording.val = false;
        }
    } else {
        if (gui.button("Record")) {
            startRecord(gl, canvas);
        }
    }
    
    gui.sameLine();
    gui.textLine(recordingMessage);

    gui.sliderInt("Recording Time", recordingTime, 1, 180);

    gui.separator();

    if (gui.button("Export")) {

        var json = water.export();

        var blob = new Blob([json], {type: "text/plain;charset=utf-8"});

        // use json text to generate hash. This hash then uniquely identifies the level.
        var h = hash(json);
        var filename = "level" + h + ".json";

        saveAs(blob, filename);
    }
    gui.sameLine();
    if (gui.button("Import")) {
        var json = prompt("Please paste exported json below");

        if (json != null) {
            if(water.import(json)) {

                water.reset();
                importMessage = "Import Succeeded!";
            } else {
                importMessage = "Import Failed!";
            }
        }
    }

    gui.textLine(importMessage);
    
    gui.end(gl, canvas.width, canvas.height);

});

var leftClicked = false;
var rightClicked = false;

shell.on("tick", function () {
    var gl = shell.gl


    if(shell.wasDown("P")) {
        water.reset();
    }

    // if interacting with the GUI, do not let the mouse control the simulation.
    if (gui.hasMouseFocus())
        return;

    var leftDown = shell.wasDown("mouse-left");
    var rightDown = shell.wasDown("mouse-right");


    if (!leftClicked && leftDown == true) {

        if (editMode.val == EM_REMOVE) {
            water.remove(shell.mouse);
            editEmitter = null;
        } else if (editMode.val == EM_ADD_CAPSULE) {
            water.addCapsule(shell.mouse, capsuleRadius.val*0.1);
        } else if (editMode.val == EM_ADD_EMITTER) {
            var newEmitter = water.addEmitter(shell.mouse);
            editEmitter = newEmitter;
        } else if (editMode.val == EM_EDIT_EMITTER) {
            var e = water.selectEmitter(shell.mouse);

            if (e != null) {
                editEmitter = e;
            }

        }

        leftClicked = true;
    }

    if (!rightClicked && rightDown == true) {

        if (editMode.val == EM_ADD_CAPSULE) {
            water.cancelAddCapsule();
        }

        rightClicked = true;
    }

    if (leftDown == false) {
        leftClicked = false;
    }
    if (rightDown == false) {
        rightClicked = false;
    }
});