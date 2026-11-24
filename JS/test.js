
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

if (gl == null) {
    alert("WebGL not supported");
}
gl.clearColor(1.0, 1.0, 1.0, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

var vshader_point_sphere =
    'attribute vec4 position;' +
    'attribute float size;' +
    'uniform float rotation;' +
    'void main() {' +
    'float c = cos(rotation);' +
    'float s = sin(rotation);' +
    '   vec4 pos = vec4(position.x * c + position.z *s,position.y,-position.z * s + position.x * c, 1.0);' +
    '   gl_Position = pos;' +
    '   gl_PointSize = size;' +
    '}';
var fshader =
    'precision mediump float;' +
    'void main() {' +
    '   gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);' +
    '}';
var vshader_click =
    'attribute vec3 position;' +
    'void main() {' +
    '   gl_Position = vec4(position, 1.0);' +
    '   gl_PointSize = 10.0;' +
    '}';
var fshader_click =
    'precision mediump float;' +
    'void main() {' +
    '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);' +
    '}';
var program = compileShader(gl, vshader_point_sphere, fshader);
var click_program = compileShader(gl, vshader_click, fshader_click);


// Clear the canvas
gl.clear(gl.COLOR_BUFFER_BIT);

const POINTS_N = 1000;
const data = new Float32Array(POINTS_N * 3);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

for (var i = 0; i < POINTS_N; i++) {
    var a = Math.acos(2 * Math.random() - 1);
    var b = Math.random() * 2 * Math.PI;
    var r = 0.8;//Math.random() * 0.5;

    var [x, y, z] = sphereToXyz(a, b, r);

    data[i * 3] = x;
    data[i * 3 + 1] = y;
    data[i * 3 + 2] = z;
}

gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
const position_ptr = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(position_ptr);
gl.vertexAttribPointer(position_ptr, 3, gl.FLOAT, false, 0, 0);

const rotation_ptr = gl.getUniformLocation(program, "rotation")

var size = gl.getAttribLocation(program, "size");
gl.vertexAttrib1f(size, 2.0);


const bufferClick = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferClick);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 0.0, 0.0]), gl.STATIC_DRAW);

var pos_click = gl.getAttribLocation(click_program, "position");
gl.vertexAttrib4f(pos_click, 0.0, 0.0, 0.0, 1.0);


startTime = Date.now();
let TimeDelta = 0;
const base_speed = 2 * Math.PI / 10000

let mouse = { x: 0, y: 0, down: false };
let ressort = { x: 0, y: 0, k_mass: 0.1, velocity: { x: 0, y: 0 }, drag: 0.1};
canvas.addEventListener("mousedown", function (event) {
    [mouse.x, mouse.y] = mouseToClipSpace(event.clientX, event.clientY);
    ressort.x = mouse.x;
    ressort.y = mouse.y;
    mouse.down = true;
    console.log("Mouse click at: ", mouse.x, mouse.y);

});

canvas.addEventListener("mouseup", function (event) {
    mouse.down = false;
    console.log("Mouse released at: ", mouse.x, mouse.y);
});
canvas.addEventListener("mousemove", function (event) {
    if (mouse.down) {
        [mouse.x, mouse.y] = mouseToClipSpace(event.clientX, event.clientY);
        console.log("Mouse moved to: ", mouse.x, mouse.y, mouse.down);
    }
});

startTime = Date.now();
TimeDelta = 0;


requestAnimationFrame(loop);

function loop() {

    ressort.velocity.x += (mouse.x - ressort.x) * ressort.k_mass - ressort.velocity.x * ressort.drag;
    ressort.velocity.y += (mouse.y - ressort.y) * ressort.k_mass - ressort.velocity.y * ressort.drag;
    ressort.x += ressort.velocity.x;
    ressort.y += ressort.velocity.y;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(position_ptr, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(position_ptr);
    TimeDelta = Date.now() - startTime;
    gl.uniform1f(rotation_ptr, TimeDelta * base_speed);
    // Draw points
    gl.drawArrays(gl.POINTS, 0, 1000);
    //if (mouse.down) {
        gl.useProgram(click_program);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferClick);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ressort.x, ressort.y, 0.0, 0.0]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(pos_click, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(pos_click);

        gl.drawArrays(gl.POINTS, 0, 1);
    //};
    requestAnimationFrame(loop);
}

function mouseToClipSpace(x, y) {
    var rect = canvas.getBoundingClientRect();
    var clipX = (x - rect.left) / rect.width * 2 - 1;
    var clipY = 1 - (y - rect.top) / rect.height * 2;
    return [clipX, clipY];
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

