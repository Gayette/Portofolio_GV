// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function ( /* function */ callback, /* DOMElement */ element) {
        window.setTimeout(callback, 1000 / 60);
    };
})();


var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

var points = [],
    currentPoint = 1,
    speed = 4,
    targetX = 0,
    targetY = 0,
    x = 0,
    y = 0;
    
// make some points
for (var i = 0; i < 50; i++) {
    points.push({
        x: i * (canvas.width),
        y: 100+Math.sin(i)
    });
}

// set the initial target and starting point
targetX = points[1].x;
targetY = points[1].y;
x = points[0].x;
y = points[0].y;

function draw() {
    var tx = targetX - x,
        ty = targetY - y,
        dist = Math.sqrt(tx*tx+ty*ty),
        velX = (tx/dist)*speed,
        velY = (ty/dist)*speed;
    
        x += velX
        y += velY;
       
    if(dist < 1){
        currentPoint++;
        
        if(currentPoint >= points.length){
            currentPoint = 1;
            x = points[0].x;
            y = points[0].y;
        }
        
        targetX = points[currentPoint].x;
        targetY = points[currentPoint].y;
    }
    
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#2068A8';
    ctx.fillStyle = '#2068A8';
    
    for (var p = 0, plen = currentPoint-1; p < plen; p++) {
        ctx.lineTo(points[p].x, points[p].y);
    }
    ctx.lineTo(x, y);    
    ctx.stroke();
    
    requestAnimFrame(draw);
}

draw();