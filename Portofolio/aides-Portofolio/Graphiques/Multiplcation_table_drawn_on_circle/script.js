/**
 * Created by simonbuisson on 2/19/16.
 */
var API = (function(window, document, undefined){

	// Canvas vars
	var canvas  = document.getElementById('canvas'),
		ctx		= canvas.getContext("2d"),
		cH, cW; // Canvas height / Canvas width

	var debug = false;


	// Colors for different elements
	var colors = {
		"circle": "black",
		"point" : "red",
		"text":   "blue",
		"line":   "purple"
	};

	// Circle variables
	var r = null; // Circle radius
	var cx, cy;   // Circle center coordinate

	// Set canvas and circle sizez
	function init(){
		canvas.height = window.innerHeight;
		canvas.width =  window.innerWidth;

		cH = canvas.height;
		cW = canvas.width;

		r = (cW > cH ? cH : cW) / 2 * 0.9;

		cx = cW / 2;
		cy = cH / 2;

		drawOuterCircle();
	}


	// Draw outer circle
	function drawOuterCircle(){
		ctx.beginPath();
		ctx.arc(
			cx,
			cy,
			r,
			0,
			2*Math.PI
		);

		ctx.strokeStyle = colors.circle;
		ctx.stroke();
	}

	// Clean up whole scene
	function resetScene(){
		ctx.clearRect(0,0,cW,cH);
		drawOuterCircle();
	}


	// Place point on circle
	var pointSize = 4;
	function placePoint(angle){

		var x = cx + r * Math.cos(angle);
		var y = cy + r * Math.sin(angle);

		// Draw if debug
		if( debug ){

			// Write text
			ctx.fillStyle = colors.text;
			ctx.fillText(
				angle / Math.PI,
				x + 6, // + 6 to move text
				y
			);

			// Draw point
			ctx.fillStyle = colors.point;
			ctx.fillRect(
				x - pointSize / 2,
				y - pointSize / 2,
				pointSize,
				pointSize
			);
		}
	}

	// Equally place dots on circle from 0 to number
	function placePointsOnCircle(modulo){
		for( var i = 0 ; i < modulo ; i++ ){
			var value = i * 2 / modulo;
			placePoint(value * Math.PI, debug);
		}
	}

	// Draw line from 1 coordinate to the other
	function drawLine(from, to){
		ctx.strokeStyle = colors.line;
		ctx.beginPath();
		ctx.moveTo.apply(ctx, from);
		ctx.lineTo.apply(ctx, to);
		ctx.stroke();
	}


	// Draw new table in Circle
	function drawMultipleTable(multiple, modulo){
		// Clear scene
		resetScene();

		// Place base coordinates on circle
		placePointsOnCircle(modulo);

		// Calculate point coordinate on circle
		function returnPointCoods(angle){
			var x = cx + r * Math.cos(angle);
			var y = cy + r * Math.sin(angle);

			return [x,y];
		}

		// Return color
		function rainbow(numOfSteps, step) {
			var r, g, b;
			var h = step / numOfSteps;
			var i = ~~(h * 6);
			var f = h * 6 - i;
			var q = 1 - f;
			switch(i % 6){
				case 0: r = 1; g = f; b = 0; break;
				case 1: r = q; g = 1; b = 0; break;
				case 2: r = 0; g = 1; b = f; break;
				case 3: r = 0; g = q; b = 1; break;
				case 4: r = f; g = 0; b = 1; break;
				case 5: r = 1; g = 0; b = q; break;
			}
			var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
			return (c);
		}

		// Draw lines
		for( var i=0; i <= modulo ; i++){

			//colors.line = rainbow(i,modulo);

			drawLine(
				returnPointCoods(i * 2 / modulo * Math.PI),
				returnPointCoods(i * multiple * 2 / modulo * Math.PI)
			)

		}
	}

	window.onresize = function(){
		init();
	};
	init();


	// Public API
	return {
		colors:colors,
		drawMultipleTable: drawMultipleTable,
		clear: resetScene
	}


})(window, document);


   (function(){
        var moduloValue = 350;

        var maxTable = 10,
            multiple = 2;   
     

        function changeTable(){
            var itv = setInterval(function draw(){
                API.drawMultipleTable(multiple,moduloValue);
                multiple += 0.01;
                if( multiple == maxTable )
                    clearInterval(itv);

            },40);
        }

        changeTable();
    })();