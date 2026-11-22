
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
    'attribute float time;' +
    'void main() {' +
    '   gl_Position = position;' +
    '   gl_PointSize = size;' +
    '}';
var fshader =
    'precision mediump float;' +
    'void main() {' +
    '   gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);' +
    '}';
var program = compileShader(gl, vshader, fshader);


// Clear the canvas
gl.clear(gl.COLOR_BUFFER_BIT);

for (var i = 0; i < 1000; i++) {
    var a = Math.random() * 2 * Math.PI;
    var b = Math.random() * 2 * Math.PI;
    var r = 0.5;//Math.random() * 0.5;

    var [x, y, z] = sphereToXyz(a, b, r);

    var position = gl.getAttribLocation(program, "position");
    var size = gl.getAttribLocation(program, "size");
    
    gl.vertexAttrib4f(position, x, y, 0.0, 1.0);
    gl.vertexAttrib1f(size, 2.0);
}

var time = gl.getAttribLocation(program, "time");
gl.vertexAttrib1f(time, 0.0);
var startTime = getTime();

function loop() {
    var currentTime = getTime();
    var elapsedTime = currentTime - startTime;
    gl.vertexAttrib1f(time, elapsedTime);
    // Draw points
    gl.drawArrays(
        gl.POINTS, // mode
        0,         // starting point
        500          // number of points to draw);
    );
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);



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

