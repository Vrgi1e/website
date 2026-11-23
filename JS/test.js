
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

if (gl == null) {
    alert("WebGL not supported");
}
gl.clearColor(1.0, 1.0, 0.0, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

var vshader =
    'attribute vec4 position;' +
    'attribute float size;' +
    'uniform float rotation;' +
    'void main() {' +
    'float c = cos(rotation);' +
    'float s = sin(rotation);' +
    '   vec4 pos = vec4(position.x * c + position.z *s,position.y,position.z * s   - position.x * c, 1.0);' +
    '   gl_Position = pos;' +
    '   gl_PointSize = size;' +
    '}';
var fshader =
    'precision mediump float;' +
    'void main() {' +
    '   gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);' +
    '}';
var program = compileShader(gl, vshader, fshader);


// Clear the canvas
gl.clear(gl.COLOR_BUFFER_BIT);

const POINTS_N = 1000;
const data = new Float32Array(POINTS_N * 3);

for (var i = 0; i < POINTS_N; i++) {
    var a = Math.acos(2 * Math.random() - 1);
    var b = Math.random() * 2 * Math.PI;
    var r = 0.8;//Math.random() * 0.5;

    var [x, y, z] = sphereToXyz(a, b, r);

    data[i * 3] = x;
    data[i * 3 + 1] = y;
    data[i * 3 + 2] = z;

    var position = gl.getAttribLocation(program, "position");
    var size = gl.getAttribLocation(program, "size");
    var rotation = gl.getAttribLocation(program, "rotation");
    gl.vertexAttrib1f(rotation, 0.0);
    gl.vertexAttrib4f(position, x, y, 0.0, 1.0);
    gl.vertexAttrib1f(size, 2.0);
}
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

const positionLoc = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

const rotationLoc = gl.getUniformLocation(program, "rotation")

startTime = Date.now();
let TimeDelta = 0;

requestAnimationFrame(loop);


function loop() {
    TimeDelta = Date.now() - startTime;

    gl.uniform1f(rotationLoc, TimeDelta * 2*Math.PI / 10000);
    // Draw points
    gl.drawArrays(
        gl.POINTS, // mode
        0,         // starting point
        1000          // number of points to draw);
    );
    requestAnimationFrame(loop);
}

function sphereToXyz(a, b, r) {
    var x = r * Math.sin(a) * Math.cos(b);
    var y = r * Math.sin(a) * Math.sin(b);
    var z = r * Math.cos(a);
    return [x, y, z];
}
function rotationMatrix(x, y, theta) {
    var x = x * Math.cos(theta) + y * Math.sin(theta);
    var y = -x * Math.sin(theta) + y * Math.cos(theta);
    return [x, y];
}

function compileShader(gl, vshader, fshader) {
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vshader);
    gl.compileShader(vs);

    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fshader);
    gl.compileShader(fs);

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Log compilation errors, if any
    console.log('vertex shader:', gl.getShaderInfoLog(vs) || 'OK');
    console.log('fragment shader:', gl.getShaderInfoLog(fs) || 'OK');
    console.log('program:', gl.getProgramInfoLog(program) || 'OK');
    return program;
}

