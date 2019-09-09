var socket;

socket = io(window.location.host, {
  query: 'r_var=paint'
});

var nickname = getCookie('nickname');
var workspace = document.getElementById('workspace');
var typingStatusPlaceholder = document.getElementById('typing-status');
var resetBtn = document.getElementById('reset-btn');
var saveBtn = document.getElementById('save-btn');
var canvas = document.getElementById('draw');
var ctx = canvas.getContext('2d');
var isDrawing = false;
var lastX = 0;
var lastY = 0;
var direction = true;
var isFresh = true;
var isRainbow = false;
var color = 'rgb(0,0,0)';
var canvasFillColor = '#ffffff';
workspace.style.backgroundColor = canvasFillColor;
ctx.font = '60px Segoe UI';
ctx.fillStyle = '#000000';
ctx.textAlign = 'center';
ctx.fillText('Draw Here', canvas.width / 2, canvas.height / 2);
ctx.strokeStyle = color;
ctx.lineWidth = 3;
var hue = 0;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

canvas.addEventListener('mousemove', draw);

canvas.addEventListener('mousedown', e => {
  isDrawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener('mouseup', () => {
  socket.emit('stopped drawing');
  isDrawing = false;
});

canvas.addEventListener('mouseout', () => {
  socket.emit('stopped drawing');
  isDrawing = false;
});

function draw(e) {
  if (isDrawing === false) return;
  if (isFresh) {
    removeDefaultText();
  }
  // Send drawing coordinates to all the connected clients
  socket.emit('someone is drawing', nickname);
  socket.emit('draw', {
    lastX,
    lastY,
    offsetX: e.offsetX,
    offsetY: e.offsetY,
    hue,
    isRainbow,
    color,
    lineWidth: ctx.lineWidth,
    state: canvas.toDataURL('image/png')
  });
  // Initiating the drawing
  ctx.beginPath();
  //Setting the start position of the mouse
  ctx.moveTo(lastX, lastY);
  // Setting the final point that is the current position of the mouse
  ctx.lineTo(e.offsetX, e.offsetY);
  // Drawing the line
  ctx.stroke();
  // Resetting the last position to the new position
  lastX = e.offsetX;
  lastY = e.offsetY;
  if (isRainbow) {
    // Randomizing the hue
    hue++;
    // Setting the strokestyle to random hue
    ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
    // Resetting hue once over the hue limit
    if (hue >= 360) {
      hue = 0;
    }
    // Reverse the direction of brush size growth once reached a specifed limit
    if (ctx.lineWidth >= 50 || ctx.lineWidth <= 1) {
      direction = !direction;
    }
    // Grow the brush size depending on the new direction
    if (direction) {
      ctx.lineWidth++;
    } else {
      ctx.lineWidth--;
    }
  }
}

function drawOther(
  lastX,
  lastY,
  offsetX,
  offsetY,
  hue,
  isRainbow,
  color,
  lineWidth
) {
  if (isFresh) {
    removeDefaultText();
  }
  if (isRainbow) {
    ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
  } else {
    ctx.strokeStyle = color;
  }
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(offsetX, offsetY);
  ctx.stroke();
}

socket.on('draw', function(payload) {
  drawOther(
    payload.lastX,
    payload.lastY,
    payload.offsetX,
    payload.offsetY,
    payload.hue,
    payload.isRainbow,
    payload.color,
    payload.lineWidth
  );
});

resetBtn.addEventListener('click', function() {
  resetCanvas();
  socket.emit('reset');
});

saveBtn.addEventListener('click', function() {
  if (isFresh) {
    alert('Canvas is empty');
  } else {
    var newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    var newCtx = newCanvas.getContext('2d');
    newCtx.fillStyle = canvasFillColor;
    newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);
    newCtx.drawImage(canvas, 0, 0);
    var a = document.createElement('a');
    a.setAttribute('href', newCanvas.toDataURL('image/png'));
    a.setAttribute('download', 'canvas');
    a.click();
  }
});

socket.on('someone is drawing', function(nickname) {
  typingStatusPlaceholder.textContent = nickname + ' is drawing...';
});

socket.on('stopped drawing', function() {
  typingStatusPlaceholder.textContent = '';
});

socket.on('change background', function(color) {
  workspace.style.backgroundColor = color;
  canvasFillColor = color;
});

socket.on('reset', function() {
  resetCanvas();
});

var colors = Array.from(document.getElementsByClassName('color'));
var sizes = Array.from(document.getElementsByClassName('size'));
var brushColor = document.getElementById('brush-color');
var canvasColor = document.getElementById('canvas-color');
var eraser = document.getElementById('eraser');
var isErasing = false;
brushColor.value = '#000000';
canvasColor.value = '#ffffff';

colors.forEach(function(color) {
  color.addEventListener('click', selectColor);
});
sizes.forEach(function(size) {
  size.addEventListener('click', selectSize);
});

brushColor.addEventListener('input', selectCustomColor);
canvasColor.addEventListener('input', selectCustomCanvasColor);
eraser.addEventListener('click', selectColor);

function selectColor(e) {
  if (e.target.classList.contains('fa-eraser')) {
    color = eraser.dataset.color;
    ctx.lineWidth = 40;
    isErasing = true;
  } else {
    color = getComputedStyle(e.target).backgroundColor;
    isErasing = false;
  }
  var rgb = color
    .replace('rgb', '')
    .replace('(', '')
    .replace(')', '')
    .replace(' ', '')
    .split(',');
  var hex = convertToHex(rgb[0], rgb[1], rgb[2]);
  brushColor.value = hex;
  ctx.strokeStyle = color;
  isRainbow = false;
}

function selectCustomColor(e) {
  color = this.value;
  ctx.strokeStyle = color;
  isRainbow = false;
  isErasing = false;
}

function selectCustomCanvasColor(e, color) {
  canvasFillColor = color || this.value;
  eraser.setAttribute('data-color', canvasFillColor);
  if (isErasing) {
    ctx.strokeStyle = canvasFillColor;
  }
  workspace.style.backgroundColor = canvasFillColor;
  socket.emit('change background', canvasFillColor);
}

var convertToHex = function(r, g, b) {
  var red = rgbToHex(r);
  var green = rgbToHex(g);
  var blue = rgbToHex(b);
  return '#' + red + green + blue;
};

var rgbToHex = function(rgb) {
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = '0' + hex;
  }
  return hex;
};

function selectSize(e) {
  ctx.lineWidth = this.dataset.size;
}

var selectRandomButton = document.getElementById('random-btn');
selectRandomButton.addEventListener('click', function() {
  isRainbow = true;
  ctx.strokeStyle = `hsl(${0}, 100%, 50%)`;
});

function removeDefaultText() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  isFresh = false;
}

function resetCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '60px Segoe UI';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.fillText('Draw Here', canvas.width / 2, canvas.height / 2);
  canvasFillColor = '#ffffff';
  selectCustomCanvasColor(null, canvasFillColor);
  isFresh = true;
}

socket.on('connect', function() {
  socket.emit('get current state');
  socket.on('get current state', function(state, bgColor) {
    if (state !== null) {
      removeDefaultText();
      isFresh = false;
      var image = new Image();
      image.onload = function() {
        ctx.drawImage(image, 0, 0);
      };
      image.src = state;
    }

    if (bgColor !== null) {
      canvasFillColor = bgColor;
      selectCustomCanvasColor(null, bgColor);
    }
  });
});
