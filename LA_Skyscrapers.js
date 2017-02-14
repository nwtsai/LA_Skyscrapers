// CS174A Midterm Hackathon
//
// BRYAN HO     | UID 204-840-587
// NATHAN TSAI  | UID
//

var canvas;                 // canvas to be initalized to height specified in index.html
var gl;                     // instance of WebGL set up given the canvas
var program;                // contains initalized shaders
var color;                  // color variable to be initialized later allowing for coloring of buildings
var points = [];            // array to be initalized later consisting of values to be used in gl.TRIANGLE_STRIP and gl.LINES
var buffer;                 // buffer to contain data to be passed to GPU
var aspect;                 // aspect ratio will be assigned in init()
var angle = 0;              // rotational degree of camera, used to control heading/azimuth
var x = 0;                  // x position starts at 0 adjusted by 'j' and 'k'
var y = 0;                  // y position starts at 0 adjusted by up and down
var z = -25;                // z position starts at -30 adjusted by 'i' and 'm'
var modelViewMatrix;        // model view matrix
var projMatrix;             // projection matrix
var orthoProjMatrix;        // orthogonal projection matrix
var scaleIndex = 0;         // counter for iterating through scale matrix

var time;                   // keeps track of current time in floating point
var timer = new Timer();    // timer object to keep track of elapsed time
var timeSec;                // keeps track of truncated time in seconds

const buildingColors = [
  vec4(128/255, 000/255,  128/255,  255/255),  // PURPLE
  vec4(000/255, 000/255,  255/255,  255/255),  // NAVY
  vec4(128/255, 000/255,  000/255,  255/255),  // MAROON
  vec4(000/255, 128/255,  128/255,  255/255),  // TEAL
  vec4(128/255, 128/255,  000/255,  255/255),  // OLIVE
  vec4(097/255, 064/255,  081/255,  255/255),  // EGGPLANT
  vec4(184/255, 115/255,  051/255,  255/255),  // COPPER
  vec4(037/255, 056/255,  060/255,  255/255),  // DARK SLATE GRAY
  vec4(128/255, 000/255,  128/255,  255/255),  // PURPLE
  vec4(000/255, 000/255,  255/255,  255/255),  // NAVY
  vec4(128/255, 000/255,  000/255,  255/255),  // MAROON
  vec4(000/255, 128/255,  128/255,  255/255),  // TEAL
  vec4(128/255, 128/255,  000/255,  255/255),  // OLIVE
  vec4(097/255, 064/255,  081/255,  255/255),  // EGGPLANT
  vec4(184/255, 115/255,  051/255,  255/255),  // COPPER
  vec4(037/255, 056/255,  060/255,  255/255),  // DARK SLATE GRAY
  vec4(128/255, 000/255,  128/255,  255/255),  // PURPLE
  vec4(000/255, 000/255,  255/255,  255/255),  // NAVY
  vec4(128/255, 000/255,  000/255,  255/255),  // MAROON
  vec4(000/255, 128/255,  128/255,  255/255),  // TEAL
  vec4(128/255, 128/255,  000/255,  255/255),  // OLIVE
  vec4(097/255, 064/255,  081/255,  255/255),  // EGGPLANT
  vec4(184/255, 115/255,  051/255,  255/255),  // COPPER
  vec4(037/255, 056/255,  060/255,  255/255),  // DARK SLATE GRAY
  vec4(128/255, 000/255,  128/255,  255/255),  // PURPLE
  vec4(000/255, 000/255,  255/255,  255/255),  // NAVY
  vec4(128/255, 000/255,  000/255,  255/255),  // MAROON
  vec4(000/255, 128/255,  128/255,  255/255),  // TEAL
  vec4(128/255, 128/255,  000/255,  255/255),  // OLIVE
  vec4(097/255, 064/255,  081/255,  255/255),  // EGGPLANT
  vec4(184/255, 115/255,  051/255,  255/255),  // COPPER
  vec4(037/255, 056/255,  060/255,  255/255),  // DARK SLATE GRAY
  vec4(128/255, 000/255,  128/255,  255/255),  // PURPLE
  vec4(000/255, 000/255,  255/255,  255/255),  // NAVY
  vec4(128/255, 000/255,  000/255,  255/255)   // MAROON
];

const numBuildings = 35;    // number of buildings to be drawn
var vert = [];              // array to keep track of verticies, filled in init() function
var positions = [];         // array to keep track of positions, filled in init() function
var heights =   [1100,  1018, 858,  750,  748,  735,  725,  723,  717,  699,  699,  667,  625,  620,  578,  571,  571,  560,  534,  533,  517,  516,  506,  496,  493,  491,  478,  463,  454,  454,  454,  450,  443,  417,  414 ];
var duration =  [5,     2,    3,    2,    3,    4,    3,    2,    2,    2,    2,    2,    3,    2,    2,    3,    3,    2,    1,    1,    3,    3,    2,    2,    2,    2,    2,    2,    4,    3,    3,    3,    4,    2,    3];
var startTime = [2012,  1987, 1970, 1992, 1988, 1992, 1988, 1981, 1988, 1970, 1970, 2005, 1978, 1967, 1983, 1972, 1972, 1981, 1985, 1989, 1990, 1965, 1984, 1985, 2001, 2007, 1988, 1926, 1946, 1965, 1958, 1968, 1967, 1973, 1954];
var year = [];

// keeps track of number of buildings in each category
var nCount = 0;
var sCount = 0;
var eCount = 0;
var wCount = 0;

// array to keep track of gradient colors for each category
var nColors = [];
var sColors = [];
var eColors = [];
var wColors = [];

// separate counter to keep track of number of buildings in each category
var nCounter = 0;
var sCounter = 0;
var eCounter = 0;
var wCounter = 0;

// boolean toggling controls
var controlsBool = 1;

window.onload = function init() {

  // has left most position of first tower
  var leftAlign = numBuildings / -2.0;

  // adds initial vertices to vert array and position vectors to positions array
  // also keeps track of time period for buildings
  for (var i = 0; i < numBuildings; i++) {
    vert.push([
      vec3(-0.5, -0.1,  0.5),
      vec3(-0.5,  0.0,  0.5),
      vec3( 0.5,  0.0,  0.5),
      vec3( 0.5, -0.1,  0.5),
      vec3(-0.5, -0.1, -0.5),
      vec3(-0.5,  0.0, -0.5),
      vec3( 0.5,  0.0, -0.5),
      vec3( 0.5, -0.1, -0.5)
    ]);
    positions.push(vec3(leftAlign, -10, 10));
    leftAlign += 1;

    if (startTime[i] >= 1924 && startTime[i] <= 1949) {
      year.push(1);
      nCount++;
    }
    else if (startTime[i] >= 1950 && startTime[i] <= 1974) {
      year.push(2);
      sCount++;
    }
    else if (startTime[i] >= 1975 && startTime[i] <= 1999) {
      year.push(3);
      eCount++;
    }
    else {
      year.push(4);
      wCount++;
    }
  }

  for (var i = 0; i < nCount; i++)
    nColors.push(vec4((78 + i * 150.0 / nCount) / 255, (186 + i * 150.0 / nCount) / 255, (111 + i * 150.0 / nCount) / 255, 1.0));
  for (var i = 0; i < sCount; i++)
    sColors.push(vec4((241 + i * 150.0 / sCount) / 255, (90 + i * 150.0 / sCount) / 255, (90 + i * 150.0 / sCount) / 255, 1.0));
  for (var i = 0; i < eCount; i++)
    eColors.push(vec4((45 + i * 150.0 / eCount) / 255, (149 + i * 150.0 / eCount) / 255, (191 + i * 150.0 / eCount) / 255, 1.0));
  for (var i = 0; i < wCount; i++)
    wColors.push(vec4((149 + i * 150.0 / wCount) / 255, (91 + i * 150.0 / wCount) / 255, (165 + i * 150.0 / wCount) / 255, 1.0));

  // sets start time to be the minimum of construction year begin (startTime)
  time = Math.min.apply(null, startTime);
  timeSec = Math.trunc(time);

  // set up WebGL capable HTML canvas
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) alert("WebGL is not available!"); // WebGL not available
  aspect = canvas.width / canvas.height;

  // Keyboard Listener
  // Key Codes from https://css-tricks.com/snippets/javascript/javascript-keycodes/
  document.onkeydown = function(key) {
    key = key || window.event;

    // angleD now has the absolute value of input angle in degrees
    // angleR has angleD but in radians
    angleD = Math.abs(angle % 360);
    angleR = angleD * Math.PI/180;

    // calculate opposite and adjacent value from basic trigonometric functions
    // angle is calculated based on current camera angle, adjusted by right, left, up, and down
    var opp = Math.tan(Math.abs(angleR)) * Math.sqrt(0.25 / (1 + Math.pow(Math.tan(Math.abs(angleR)), 2) ) );
    var adj = Math.sqrt(0.25 / (1 + Math.pow(Math.tan(Math.abs(angleR)), 2) ) );

    // Switching on different key codes
    switch(key.keyCode) {
      case 87: // 'w' moves camera along the Y axis by +0.25 units
        y -= 0.25; // because objects move down relative to camera
        break;

      case 83: // 's' moves camera along the Y axis by -0.25 units
        y += 0.25 // because objects move up relative to camera
        break;

      case 65: // 'a' rotates camera to the left by 4 degrees
        angle--;
        break;

      case 68: // 'd' rotates camera to the right by 4 degrees
        angle++;
        break;

      case 73: // 'i' moves camera forward 0.25 units
        x -= opp;
        z += adj;
        break;

      case 74: // 'j' moves camera left 0.25 units
        x += adj;
        z += opp;
        break;

      case 75: // 'k' moves camera right 0.25 units
        x -= adj;
        z -= opp;
        break;

      case 77: // 'm' moves camera back 0.25 units
        x += opp;
        z -= adj;
        break;

      case 82: // 'r' reset the view to the start position
        x = 0;
        y = 0;
        z = -25;
        aspect = canvas.width / canvas.height;
        angle = 0;

        // pops verticies for reset
        for (var i = 0; i < numBuildings; i++) vert.pop();

        // pushes "clean" set of vertices
        for (var i = 0; i < numBuildings; i++)
          vert.push([
            vec3(-0.5, -0.1,  0.5),
            vec3(-0.5,  0.0,  0.5),
            vec3( 0.5,  0.0,  0.5),
            vec3( 0.5, -0.1,  0.5),
            vec3(-0.5, -0.1, -0.5),
            vec3(-0.5,  0.0, -0.5),
            vec3( 0.5,  0.0, -0.5),
            vec3( 0.5, -0.1, -0.5)
          ]);
        time = Math.min.apply(null, startTime); // reset timer
        timeSec = Math.trunc(time); // reset timeSec

        break;

      case 72: // 'h' toggles controls and title
        // hides controls
        if (controlsBool) {
          $(".controller-wrapper").hide();
          $("#graph-title").hide();
          $("#current-year").hide();
          controlsBool = 0;
        }
        // shows controls
        else {
          $(".controller-wrapper").show();
          $("#graph-title").show();
          $("#current-year").show();
          controlsBool = 1;
        }

    } // switch(key.keyCode)
  };

  // set clear color to dusty gray, representative of the Los Angeles sky
  gl.clearColor(153/255.0, 153/255.0, 153/255.0, 1.0);

  // canvas.width and canvas.height have been defined to be 960 in index.html
  gl.viewport(0, 0, canvas.width, canvas.height);

  // enable z-buffer
  gl.enable(gl.DEPTH_TEST);

  // implement necessary shader codes
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // reset timer before every render() call
  timer.reset();

  render();
}; //init()

function render() {

  // gets elapsed time in seconds
  time += timer.getElapsedTime() / 500.0;

  // only update every second
  if (timeSec != Math.trunc(time)) {
    if (timeSec <= 2017) $("#current-year").text("Current Year: " + timeSec); // displays current year
    timeSec = Math.trunc(time);
  }

  // for each building, incrememnts height by a scale of rate if we are currently in its "construction time"
  for (var i = 0; i < numBuildings; i++) {
    if (time > startTime[i] && time < startTime[i] + duration[i]) {
      vert[i][1][1] += heights[i] / duration[i] / 1500.0;
      vert[i][2][1] += heights[i] / duration[i] / 1500.0;
      vert[i][5][1] += heights[i] / duration[i] / 1500.0;
      vert[i][6][1] += heights[i] / duration[i] / 1500.0;
    }
  }

  a = 0;
  b = 3;
  c = 1;
  d = 2;
  e = 4;
  f = 7;
  g = 5;
  h = 6;

  var indices = [a, b, c, d,    // side closest to screen in visualation
                 b, f, d, h,    // right side in visualization
                 f, e, h, g,    // side furthest from screen in visualization
                 e, a, g, c,    // left side in visualization
                 e, f, a, b,    // bottom side in visualization
                 c, d, g, h];   // top side in visualization

  // pops all points from array
  for (var i = points.length; i > 0; i--) points.pop();

  // pushes verticies into points array
  for (var i = 0; i < numBuildings; i++)
    for (var j = 0; j < indices.length; j++)
      points.push(vert[i][indices[j]]);

  var indicesEdges = [a, b, b, d, d, c, c, a,   // side closest to screen in visualization
                      e, f, f, h, h, g, g, e,   // side furthest from screen in visualization
                      d, h, b, f, a, e, c, g];  // remaining edges

  // push indices of edge outline into buffer
  for (var i = 0; i < numBuildings; i++)
    for (var j = 0; j < indicesEdges.length; j++)
      points.push(vert[i][indicesEdges[j]]);

  buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // renders the field of view affected by 'n' and 'w' keys
  projMatrix = perspective(90, aspect, 1, 100);
  orthoProjMatrix = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);

  // enables coloring of cubes
  color = gl.getUniformLocation(program, "color");
  modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");

  // clears canvas to black as specified in the specified and allows for the z buffer to be enabled
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // initialize current transformation matrix
  var ctm = mat4();

  // calls draw cube function with arguments index, transformation vector
  for (var i = 0; i < numBuildings; i++) drawCube(i, ctm);

  window.requestAnimFrame(render);
} // render()

function drawCube(index, ctm) {

  ctm = mat4();
  ctm = mult(ctm, projMatrix);
  ctm = mult(ctm, rotate(angle, [0, 1, 0]));
  ctm = mult(ctm, translate(vec3(x, y, z)));
  ctm = mult(ctm, translate(positions[index]));   // translates each of the 35 buildings to correct location

  var curColor = vec4();

  // sets color based on age group of building
  switch (year[index]) {
    case 1: // color shade for group 1
      if (nCounter == nCount) nCounter = 0;
      gl.uniform4fv(color, flatten(nColors[nCounter++]));
      break;
    case 2: // color shade for group 2
      if (sCounter == sCount) sCounter = 0;
      gl.uniform4fv(color, flatten(sColors[sCounter++]));
      break;
    case 3: // color shade for group 3
      if (eCounter == eCount) eCounter = 0;
      gl.uniform4fv(color, flatten(eColors[eCounter++]));
      break;
    case 4: // color shade for group 4
      if (wCounter == wCount) wCounter = 0;
      gl.uniform4fv(color, flatten(wColors[wCounter++]));
      break;
  }

  // draws buildings given the color
  // implement the cube geometry as a single triangle strip primitive using gl.TRIANGLE_STRIP
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0 + index * 24, 24);

  // draws outline of cubes with white color (1.0, 1.0, 1.0, 1.0) using gl.LINES
  gl.uniform4fv(color, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
  gl.drawArrays(gl.LINES, 24 * numBuildings + index * 24, 24);
} // drawCube()
