'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TAU = Math.PI * 2,
    HEX_ANGLE = TAU / 6,
    HEX_AMOUNT = 256,
    ZOOM = .5;
var BOUNDARIES = {
  x: window.innerWidth,
  y: window.innerHeight,
  z: window.innerWidth
};
/**
 * Hexagon abstraction.
 */

var Hexagon = function () {
  function Hexagon(opts) {
    _classCallCheck(this, Hexagon);

    this.center = opts.center;
    this.radius = opts.radius;
    this.direction = opts.direction;
    this.offset = opts.offset || HEX_ANGLE;
    this.numberOfPoints = opts.nop || 6;
    this.speed = 1.1;
    this.full = false;
  }

  Hexagon.prototype.getPoint = function getPoint(i) {
    var currentAngle = this.offset + i * TAU / this.numberOfPoints;
    return {
      x: this.center.x + Math.cos(currentAngle) * this.radius * this.center.z / BOUNDARIES.z,
      y: this.center.y + Math.sin(currentAngle) * this.radius * this.center.z / BOUNDARIES.z,
      z: this.center.z
    };
  };

  Hexagon.prototype.getPath = function getPath() {
    var path = new Path2D();
    path.moveTo(this.getPoint(0).x, this.getPoint(0).y);
    for (var i = 1; i < this.numberOfPoints; i++) {
      path.lineTo(this.getPoint(i).x, this.getPoint(i).y);
    }
    path.closePath();
    return path;
  };

  Hexagon.prototype.draw = function draw(context, style, full) {
    if (!full) {
      context.strokeStyle = style;
      context.stroke(this.getPath());
    } else {
      context.fillStyle = style;
      context.fill(this.getPath());
    }
  };

  Hexagon.prototype.move = function move() {
    this.center.x += this.direction.x * this.speed;
    this.center.y += this.direction.y * this.speed;
    this.center.z += this.direction.z * this.speed;
  };
  //reverse direction if we reach the border

  Hexagon.prototype.collide = function collide() {
    if (this.center.x < 0 || this.center.x > BOUNDARIES.x) {
      this.direction.x = -this.direction.x;
    }
    if (this.center.y < 0 || this.center.y > BOUNDARIES.y) {
      this.direction.y = -this.direction.y;
    }
    if (this.center.z < 0 || this.center.z > BOUNDARIES.z) {
      this.direction.z = -this.direction.z;
    }
  };

  return Hexagon;
}();

var Renderer = function () {
  function Renderer(opts) {
    _classCallCheck(this, Renderer);

    this.canvas = opts.canvas;
    this.context = this.canvas.getContext('2d');
    this.resize();
  }

  Renderer.prototype.resize = function resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.center = this.getOrigin();
  };

  Renderer.prototype.getOrigin = function getOrigin() {
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      z: window.innerWidth / 2
    };
  };

  Renderer.prototype.render = function render(hexagons) {
    var _this = this;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = 'rgb(0,0,0)';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    hexagons.forEach(function (h) {
      h.draw(_this.context, 'rgba(255,255,255,0.25)', true);
      h.collide(BOUNDARIES);
    });
  };

  return Renderer;
}();
//globals

var renderer = new Renderer({
  canvas: document.getElementById('canvas')
}),
    hexagons = [];

function animate() {
  hexagons.forEach(function (h) {
    h.move();
  });
  renderer.render(hexagons);
  requestAnimationFrame(animate);
}

function initialize() {
  var radius = 100;
  for (var i = 0; i < HEX_AMOUNT; i++) {
    var x = Math.random() * window.innerWidth;
    var y = Math.random() * window.innerHeight;
    var z = Math.random() * window.innerWidth;

    hexagons.push(new Hexagon({
      center: {
        x: x,
        y: y,
        z: z
      },
      radius: radius,
      offset: HEX_ANGLE,
      direction: {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 2 - 1
      }
    }));
  }
  animate();
}

function resize() {
  BOUNDARIES = {
    x: window.innerWidth,
    y: window.innerHeight,
    z: window.innerWidth
  };
  renderer.resize();
}

function clickHandler(event) {
  var mousePosition = {
    x: event.clientX,
    y: event.clientY
  };
  hexagons.forEach(function (h) {
    h.full = renderer.context.isPointInPath(h.getPath(), mousePosition.x, mousePosition.y);
  });
}

function touchHandler(event) {
  for (var i = 0; i < event.touches.length; i++) {
    clickHandler(event.touches[i]);
  }
}

window.addEventListener('resize', resize);
document.addEventListener('DOMContentLoaded', initialize);
canvas.addEventListener('click', clickHandler);
canvas.addEventListener('touch', touchHandler);