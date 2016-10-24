//------------------------------------------------------------------------------
// Helper
//------------------------------------------------------------------------------

function Point(x, y)
{
  this.x = x;
  this.y = y;
  
  this.clone = function()
  {
    return new Point(this.x, this.y);
  };
}

function Rectangle(x, y, width, height)
{
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  
  this.clone = function()
  {
    return new Rectangle(this.x, this.y, this.width, this.height);
  };
}

Function.prototype.bind = function(bind)
{
  var fn = this;
  return function()
  {
    return fn.apply(bind, arguments);
  };
};


//------------------------------------------------------------------------------
//
// @section ASCIICanvas
//
//------------------------------------------------------------------------------

function ASCIICanvas()
{
  this.charBoundaries = this.measureChar();
  this.clear();
}

ASCIICanvas.prototype ={
  lines: 32,
  columns: 96,
  element: document.getElementById('canvas'),
  currentTool: null,
  
  clear: function(character)
  {
    //console.time('[Canvas/clear]');
    
    if (!character)
    {
      character = '/';
    }
    
    var result = '';
    
    for (var l = 0; l < this.lines; l++)
    {
      for (var r = 0; r < this.columns; r++)
      {
        result += character;
      }
      result += '\n';
    }
    
    this.element.innerHTML = result;
    
    //console.timeEnd('[Canvas/clear]');
  },
  
  measureChar: function(character)
  {
    if (!character)
    {
      character = '#';
    }
    
    var pre = document.createElement('pre');
    pre.id = 'measureChar';
    pre.innerHTML = character;
    
    document.body.appendChild(pre);
    var result = new Rectangle(0, 0, pre.offsetWidth, pre.offsetHeight);
    document.body.removeChild(pre);
    
    return result;
  },
  
  content: function(value)
  {
    if (value !== void(0))
    {
      this.element.innerHTML = value;
    }
    return this.element.innerHTML;
  },
  
  drawChar: function(x, y, character)
  {
    //console.info('[ASCIICanvas/drawChar]', x, y);
    
    if (x > this.columns - 1 || y > this.lines - 1 || x < 0 || y < 0)
    {
      return;
    }
    
    var index = x + (y * this.columns) + y;
    
    if (character.length > 1)
    {
      character = character.substr(0, 1);
    }
    
    this.element.innerHTML = this.element.innerHTML.substr(0, index)
      + character
      + this.element.innerHTML.substr(index + 1);
  },
  
  drawLineFast: function(x1, y1, x2, y2, character)
  {
    //console.info('[ASCIICanvas/drawLineFast]', x1, y1, x2, y2);
    
    var length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    
    this.drawChar(x1, y1, character);
    
    for (var i = 1; i < length + 1; i++)
    {
      var x = Math.round(x1 + (x2 - x1) * i / length);
      var y = Math.round(y1 + (y2 - y1) * i / length);
      this.drawChar(x, y, character);
    }
  },
  
  drawLine: function(x1, y1, x2, y2, character)
  {
    //console.info('[ASCIICanvas/drawLine]', x1, y1, x2, y2);
    
    var o = this.options;
    var dx = x2 - x1;
    var sx = 1;
    var dy = y2 - y1;
    var sy = 1;
    var fraction;
    
    if (dx < 0)
    {
      sx = -1;
      dx = -dx;
    }
    
    if (dy < 0)
    {
      sy = -1;
      dy = -dy;
    }
    
    dx = dx << 1;
    dy = dy << 1;
    
    this.drawChar(x1, y1, character);
    
    if (dy < dx)
    {
      fraction = dy - (dx>>1);
      
      while (x1 != x2)
      {
        if (fraction >= 0)
        {
          y1 += sy;
          fraction -= dx;
        }
        
        fraction += dy;
        x1 += sx;
        
        this.drawChar(x1, y1, character);
      }
    }
    else
    {
      fraction = dx - (dy>>1);
      
      while (y1 != y2)
      {
        if (fraction >= 0)
        {
          x1 += sx;
          fraction -= dy;
        }
        
        fraction += dx;
        y1 += sy;
        
        this.drawChar(x1, y1, character);
      }
    }
  },
  
  drawRect: function(x, y, width, height, character, filled)
  {
    //console.info('[ASCIICanvas/drawRect]', x, y, width, height);
    
    if (width < 0)
    {
      x += width;
      width = Math.abs(width);
    }
    
    if (height < 0)
    {
      y += height;
      height = Math.abs(height);
    }
    
    if (filled)
    {
      for (var l = y; l <= height + y; l++)
      {
        this.drawLineFast(x, l, x + width, l, character);
      }
    }
    else
    {
      this.drawLineFast(x, y, x + width, y, character);
      this.drawLineFast(x, y, x, y + height, character);
      this.drawLineFast(x + width, y, x + width, y + height, character);
      this.drawLineFast(x, y + height, x + width, y + height, character);
    }
  },
  
  drawEllipse: function(xc, yc, a, b, character, filled)
  {
    //console.info('[ASCIICanvas/drawRect]', xc, yc, a, b);
    
    if (a < 0)
    {
      xc += a * 2;
      a = Math.abs(a);
    }
    
    if (b < 0)
    {
      yc += b * 2;
      b = Math.abs(b);
    }
    
    xc += a;
    yc += b;
    
    var x = 0;
    var y = b;
    
    var a2 = a * a;
    var b2 = b * b;
    
    var crit1 = -(a2 / 4 + a % 2 + b2);
    var crit2 = -(b2 / 4 + b % 2 + a2);
    var crit3 = -(b2 / 4 + b % 2);
    
    var t = -a2 * y; // e(x+1/2)-(a^2+b^4)/4
    var dxt = 2 * b2 * x;
    var dyt = -2 * a2 * y;
    
    var d2xt = 2 * b2;
    var d2yt = 2 * a2;
    
    var incX = function() { x++; dxt += d2xt; t += dxt; };
    var incY = function() { y--; dyt += d2yt; t += dyt; };
    
    if (!filled)
    {
      while (y >= 0 && x <= a)
      {
        this.drawChar(xc + x, yc + y, character);
        
        if (x != 0 || y != 0) {
          this.drawChar(xc - x, yc - y, character);
        }
        
        if (x != 0 && y != 0)
        {
          this.drawChar(xc + x, yc - y, character);
          this.drawChar(xc - x, yc + y, character);
        }
        
        if (t + b2 * x <= crit1 || t + a2 * y <= crit3)
        {
          incX();
        }
        else if (t - a2 * y > crit2)
        {
          incY();
        }
        else
        {
          incX();
          incY();
        }
      }
    }
    else
    {
      var x2 = xc;
      
      while (y >= 0 && x <= a)
      {
        this.drawLineFast(xc - x, yc - y, x2, yc - y, character);
        this.drawLineFast(xc - x, yc + y, x2, yc + y, character);
        
        if (t + b2 * x <= crit1 || t + a2 * y <= crit3)
        {
          incX();
          x2++;
        }
        else if (t - a2 * y > crit2)
        {
          
          incY();
        }
        else
        {
          incX();
          incY();
          x2++;
        }
      }
    }
  },
  
  place: function(x, y, value) {
    var startX = x;
    var startY = y;
    
    for (var i = 0, l = value.length; i < l; i++) {
      var character = value[i];
      
      if (character == '\n') {
        x = startX;
        y++;
        continue;
      }
      
      canvas.drawChar(x, y, character);
      x++;
    }
  },
  
  enableUserSelect: function(flag)
  {
    this.element.className = (flag)
      ? null
      : 'disable-selection';
  },
  
  tool: function(tool) {
    if (tool !== void(0)) {
      if (this.currentTool) {
        this.currentTool.canvas(null);
      }
      this.currentTool = tool;
      this.currentTool.canvas(this);
    }
    return this.currentTool;
  }
};


//------------------------------------------------------------------------------
//
// @section ASCIICanvasDrawTool
//
//------------------------------------------------------------------------------

ASCIICanvas.DrawTool = function()
{
  this._onMouseDown = this.onMouseDown.bind(this);
  this._onMouseMove = this.onMouseMove.bind(this);
  this._onMouseUp = this.onMouseUp.bind(this);
};

ASCIICanvas.DrawTool.prototype = {
  _canvas: null,
  _prevPoint: null,
  _character: ' ',
  _mouseDown: false,
  _fill: false,
  
  character: function(character) {
    if (character !== void(0)) {
      this._character = character;
    }
    return this._character;
  },
  
  canvas: function(canvas) {
    if (this._canvas) {
      this._canvas.element.removeEventListener('mousedown', this._onMouseDown, false);
      document.removeEventListener('mousemove', this._onMouseMove, false);
      document.removeEventListener('mouseup', this._onMouseUp, false);
    }
    
    this._canvas = canvas;
    
    if (this._canvas) {
      this._canvas.element.addEventListener('mousedown', this._onMouseDown, false);
      document.addEventListener('mousemove', this._onMouseMove, false);
      document.addEventListener('mouseup', this._onMouseUp, false);
    }
  },
  
  getPointFromMouseEvent: function(event)
  {
    var point = new Point(event.clientX, event.clientY);
    var parent = this._canvas.element;
    
    do
    {
      point.x -= parent.offsetLeft - parent.scrollLeft;
      point.y -= parent.offsetTop - parent.scrollTop;
    }
    while ((parent = parent.offsetParent) && (parent.tagName != 'HTML'));
    
    var offsetX = (2 - this._canvas.element.offsetWidth / (this._canvas.charBoundaries.width * this._canvas.columns));
    var offsetY = (2 - this._canvas.element.offsetHeight / (this._canvas.charBoundaries.height * this._canvas.lines));
    
    point.x = Math.floor((point.x / this._canvas.charBoundaries.width) * offsetX);
    point.y = Math.floor((point.y / this._canvas.charBoundaries.height) * offsetY);
    
    return point;
  },
  
  draw: function(point)
  {
    if (!this._prevPoint)
    {
      this._prevPoint = point;
    }
    
    this._canvas.drawLineFast(this._prevPoint.x, this._prevPoint.y, point.x, point.y, this._character);
    this._prevPoint = point;
  },
  
  fill: function(value)
  {
    this._fill = value;
  },
  
  onMouseDown: function(event)
  {
    event.preventDefault();
    this._mouseDown = true;
    this.draw(this.getPointFromMouseEvent(event));
  },
  
  onMouseMove: function(event)
  {
    event.preventDefault();
    
    if (this._mouseDown)
    {
      this.draw(this.getPointFromMouseEvent(event));
    }
  },
  
  onMouseUp: function(event)
  {
    event.preventDefault();
    this._mouseDown = false;
    this.draw(this.getPointFromMouseEvent(event));
    this._prevPoint = null;
  }
};


//------------------------------------------------------------------------------
//
// @section ASCIICanvas.SnapshotTool
//
//------------------------------------------------------------------------------

ASCIICanvas.SnapshotTool = function() {
  ASCIICanvas.DrawTool.apply(this, arguments);
};

ASCIICanvas.SnapshotTool.prototype = new ASCIICanvas.DrawTool();

ASCIICanvas.SnapshotTool.prototype.snapshot = null;

ASCIICanvas.SnapshotTool.prototype.onMouseDown = function(event)
{
  this.snapshot = this._canvas.content();
  ASCIICanvas.DrawTool.prototype.onMouseDown.apply(this, arguments);
};

ASCIICanvas.SnapshotTool.prototype.onMouseUp = function(event) 
{
  ASCIICanvas.DrawTool.prototype.onMouseUp.apply(this, arguments);
  this.snapshot = null;
};

ASCIICanvas.SnapshotTool.prototype.draw = function(point)
{
  if (!this.snapshot)
  {
    return;
  }
  
  if (!this._prevPoint)
  {
    this._prevPoint = point;
  }
  
  this._canvas.content(this.snapshot);
};


//------------------------------------------------------------------------------
//
// @section ASCIICanvas.LineTool
//
//------------------------------------------------------------------------------

ASCIICanvas.LineTool = function()
{
  ASCIICanvas.SnapshotTool.apply(this, arguments);
};

ASCIICanvas.LineTool.prototype = new ASCIICanvas.SnapshotTool();

ASCIICanvas.LineTool.prototype.draw = function(point)
{
  ASCIICanvas.SnapshotTool.prototype.draw.apply(this, arguments);
  
  if (!this._prevPoint) {
    return;
  }
  
  this._canvas.drawLine(
    this._prevPoint.x,
    this._prevPoint.y,
    point.x,
    point.y,
    this._character
  );
};


//------------------------------------------------------------------------------
//
// @section ASCIICanvas.RectTool
//
//------------------------------------------------------------------------------

ASCIICanvas.RectTool = function()
{
  ASCIICanvas.SnapshotTool.apply(this, arguments);
};

ASCIICanvas.RectTool.prototype = new ASCIICanvas.SnapshotTool();

ASCIICanvas.RectTool.prototype.draw = function(point)
{
  ASCIICanvas.SnapshotTool.prototype.draw.apply(this, arguments);
  
  if (!this._prevPoint) {
    return;
  }
  
  this._canvas.drawRect(
    this._prevPoint.x,
    this._prevPoint.y,
    point.x - this._prevPoint.x,
    point.y - this._prevPoint.y,
    this._character,
    this._fill
  );
};


//------------------------------------------------------------------------------
//
// @section ASCIICanvas.EclipseTool
//
//------------------------------------------------------------------------------

ASCIICanvas.EclipseTool = function()
{
  ASCIICanvas.SnapshotTool.apply(this, arguments);
};

ASCIICanvas.EclipseTool.prototype = new ASCIICanvas.SnapshotTool();

ASCIICanvas.EclipseTool.prototype.draw = function(point)
{
  ASCIICanvas.SnapshotTool.prototype.draw.apply(this, arguments);
  
  if (!this._prevPoint) {
    return;
  }
  
  this._canvas.drawEllipse(
    this._prevPoint.x,
    this._prevPoint.y,
    Math.floor((point.x - this._prevPoint.x) / 2),
    Math.floor((point.y - this._prevPoint.y) / 2),
    this._character,
    this._fill
  );
};


//------------------------------------------------------------------------------
//
// @section Initialisation
//
//------------------------------------------------------------------------------

var asciiRulez = "+-----------------------------------------------------------------------------------------+\n" +
                 "|  .d8b.  .d8888.  .o88b. d888888b d888888b   d8888b. db    db db      d88888b d88888D db |\n" +
                 "| d8' `8b 88'  YP d8P  Y8   `88'     `88'     88  `8D 88    88 88      88'     YP  d8' 88 |\n" +
                 "| 88ooo88 `8bo.   8P         88       88      88oobY' 88    88 88      88ooooo    d8'  YP |\n" +
                 "| 88~~~88   `Y8b. 8b         88       88      88`8b   88    88 88      88~~~~~   d8'      |\n" +
                 "| 88   88 db   8D Y8b  d8   .88.     .88.     88 `88. 88b  d88 88booo. 88.      d8' db db |\n" +
                 "| YP   YP `8888Y'  `Y88P' Y888888P Y888888P   88   YD ~Y8888P' Y88888P Y88888P d88888P YP |\n" +
                 "+-----------------------------------------------------------------------------------------+\n";

var canvas = new ASCIICanvas();
var tools = {
  drawTool: new ASCIICanvas.DrawTool(),
  rectTool: new ASCIICanvas.RectTool(),
  lineTool: new ASCIICanvas.LineTool(),
  ellipseTool: new ASCIICanvas.EclipseTool()
};

canvas.tool(tools.drawTool);

canvas.place(
  Math.floor((canvas.columns - 91) / 2),
  Math.floor((canvas.lines - 8) / 2),
  asciiRulez
);

document.body.className = 'color-set-5';


//---- Tool selection ----------------------------------------------------------
function tool_onChange(event) {
  var tool = tools[event.target.id];
  tool.character(document.getElementById('characterInput').value);
  tool.fill(document.getElementById('fill').checked);
  canvas.tool(tool);
}

function fill_onChange(event) {
  canvas.tool().fill(event.target.checked);
}


//---- Character input ---------------------------------------------------------
var characterInput = document.getElementById('characterInput');

function characterInput_onKeyDown(event) {
  event.target.value = '';
}

function characterInput_onKeyUp(event) {
  if (canvas.tool()) {
    canvas.tool().character(event.target.value.substr(0, 1) || ' ');
  }
}

canvas.tool().character(characterInput.value);


//---- Enable user select input ------------------------------------------------
var enableUserSelectInput = document.getElementById('enableUserSelectInput');

function enableUserSelectInput_onChange(event) {
  canvas.enableUserSelect(event.target.checked);
}

canvas.enableUserSelect(enableUserSelectInput.checked);


//---- Color set ---------------------------------------------------------------
function colorSet_onChange(event) {
  document.body.className = event.target.value;
}


//---- Create canvas -----------------------------------------------------------
function createCanvas_onClick(event) {
  canvas.columns = document.getElementById('numColumns').value;
  canvas.lines = document.getElementById('numLines').value;
  canvas.clear(canvas.tool().character());
}


//---- Copy canvas -------------------------------------------------------------
function copyCanvas_onClick(event) {
  var content = canvas.element.innerHTML;
  console.info(content);
  prompt('Please press ctrl/cmd + c to copy the contents', content);
}


//---- Global listener for keyboard events -------------------------------------
document.onkeydown = function(event) {
  if (event.target.tagName != 'INPUT') {
    characterInput.focus();
  }
};