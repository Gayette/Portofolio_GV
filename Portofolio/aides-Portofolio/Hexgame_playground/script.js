////////////////////////////////////////////////////////////////////////////////
// HEXAGONAL MAP GAME PLAYGROUND
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// CONFIGURATION

const CONFIG = {
	map: {
		mapSize: 						{ width: 13, height: 13 }, // Logical map size, in cells
		mapTopped: 					FLAT, // FLAT or POINTY
		// mapParity: 					(Math.random() < 0.5) ? EVEN : ODD, // EVEN or ODD
		mapParity: 					ODD, // EVEN or ODD
	},
	terrain: {
		mapRange: 					11, // cell height max value
		mapSeaLevel: 				2, // level of sea flood
		mapErosion: 				50, // 10: boring / 100: mangled up
		mapSmoothing: 			25, // in number of iterations
		mapLevelRatio: 			0.25, // caps the height from top OR bottom
	},
	rules: {
		playerZoneRatio: 		3	// player corner size (ex: 2 means half map)
	},
	render: {
		cellSizeBase: 			35,	// base size of a cell in px
		cellSizeRatio: 			5/6,	// perspective cell height diminution ratio
		cellSize: 					undefined, // size of the cell // COMPUTED
		mapHasPerspective: 	true,	// if not, render a (visually) flat map
		mapDeepness: 				undefined, // extrudes cells below them (in pixels) // COMPUTED
		mapRangeScale: 			5, // in pixels per height unit
	},

	players: [ {
		name: "ken", color: "#ff8000",	class: "Fighter",	level: 1,
		stats: {
			hpMax: 19,
			strength: 5, 
			magic: 1,
			defense: 5,
			resistance: 0,
			skill: 6,
			speed: 7,
			luck: 6,

			xpMax: 100,
			movement: 7,
			weight: 5,
			growthRates: [], // http://serenesforest.net/the-sacred-stones/characters/growth-rates/
			movementCosts: [], // http://serenesforest.net/the-sacred-stones/classes/terrain-data/
		},
		weapon: {
			name: "Iron sword",
			power: 5,
			hit: 75,
			critical: 10,
			weight: 3,
			range: 1
		}
	},
	{ 
		name: "ryu", color: "#ff0080",	class: "Bandit",	level: 1,
		stats: {
			hpMax: 18,
			strength: 9, 
			magic: 0,
			defense: 2,
			resistance: 7,
			skill: 9,
			speed: 9,
			luck: 5,

			xpMax: 100,
			movement: 7,
			weight: 5,
			growthRates: [], // http://serenesforest.net/the-sacred-stones/characters/growth-rates/
			movementCosts: [], // http://serenesforest.net/the-sacred-stones/classes/terrain-data/
		},
		weapon: {
			name: "Silver axe",
			power: 7,
			hit: 50,
			critical: 5,
			weight: 4,
			range: 1
		}
	} ]
};


// Computed vars

CONFIG.render.cellSize = {};
CONFIG.render.cellSize.width = CONFIG.render.cellSizeBase;
CONFIG.render.cellSize.height = CONFIG.render.cellSizeBase * CONFIG.render.cellSizeRatio; 

CONFIG.render.mapDeepness = CONFIG.render.cellSizeBase / 4;



////////////////////////////////////////////////////////////////////////////////
// TOOLZ

// ARRAY UTILS

// 2D ARRAY FILL

const multiArray = (x, y) => Array(...Array(x)).map(() => Array(y));

// ARRAY SHUFFLE
// From: http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

const shuffle = (array) => {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


// HEX COLOR MANIPULATION
// From: http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors

function shadeBlend(p,c0,c1) {
    var n=p<0?p*-1:p,u=Math.round,w=parseInt;
    if(c0.length>7){
        var f=c0.split(","),t=(c1?c1:p<0?"rgb(0,0,0)":"rgb(255,255,255)").split(","),R=w(f[0].slice(4)),G=w(f[1]),B=w(f[2]);
        return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")"
    }else{
        var f=w(c0.slice(1),16),t=w((c1?c1:p<0?"#000000":"#FFFFFF").slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF;
        return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1)
    }
}


// PRIORITY QUEUE
// From: https://jsfiddle.net/GRIFFnDOOR/r7tvg/
// Savagely adapted/mangled!

const PriorityQueue = (arr) => {
	const queue = {
		
		heap: [],

		logHeap: function() {
			let output = "HEAP - "
			for (let i = 0; i < this.heap.length; i++) {
				output += "[" + this.heap[i][0] +  " / " + this.heap[i][1] + "]";
			}
			console.log(output);
		},
		
		length: function() {
			return this.heap.length;
		},
		
		push: function(data, priority) {
			var node = [data, priority];
			this.bubble(this.heap.push(node) - 1);
		},

		// removes and returns the data of lowest priority
		pop: function() {
			return this.heap.pop()[0];
		},

		// removes and returns the data of highest priority
		popHigh: function() {
			return this.heap.shift()[0];
		},

		// bubbles node i up the binary tree based on
		// priority until heap conditions are restored
		bubble: function(i) {
			while (i > 0) { 
				// var parentIndex = i >> 1; // <=> floor(i/2)	// legacy code
				var parentIndex = i - 1;

				// if equal, no bubble (maintains insertion order)
				if (!this.isHigherPriority(i, parentIndex)) break;

				this.swap(i, parentIndex);
				i = parentIndex;
			}
		},

		// swaps the addresses of 2 nodes
		swap: function(i,j) {
			var temp = this.heap[i];
			this.heap[i] = this.heap[j];
			this.heap[j] = temp;
		},

		// returns true if node i is higher priority than j
		isHigherPriority: function(i,j) {
			return this.heap[i][1] > this.heap[j][1];
		}

	};

	if (arr) for (i=0; i< arr.length; i++)
		queue.heap.push(arr[i][0], arr[i][1]);
	
	return queue;
}


// TODO BUG !!!
// THROTTLING
// from: http://sampsonblog.com/749/simple-throttle-function

function throttle (callback, limit) {
    var wait = false;                 // Initially, we're not waiting
    return function () {              // We return a throttled function
        if (!wait) {                  // If we're not waiting
            callback.call();          // Execute users function
            wait = true;              // Prevent future invocations
            setTimeout(function () {  // After a period of time
                wait = false;         // And allow future invocations
            }, limit);
        }
    }
}




////////////////////////////////////////////////////////////////////////////////
// MAP

const Map = (size, mapTopped, mapParity, mapLevelRatio, mapRange, mapErosion, mapSeaLevel) => {

	// WEIRD: map is an 2d array WITH methods - TODO better (or not?)
	const map = multiArray(size.width, size.height);
	
	// GET FROM HEX
	// Returns a map cell from a given (cubic) hex
	map.getFromHex = (hex) => {
		const hexOffset = hex2Offset(hex, CONFIG.map.mapTopped, CONFIG.map.mapParity);
		if (map[hexOffset.col]) {
			if (map[hexOffset.col][hexOffset.row]) {
				return map[hexOffset.col][hexOffset.row];	
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	};
	
	// MAP POPULATE
	// Fill the 2d array with empty objects
	map.populate = () => {
		for (let x = 0; x < size.width; x++) {
			for (let y = 0; y < size.height; y++) {
				map[x][y] = {};
			}
		}
	};
	
	// MAP HEIGHT
	// Set the height of each cell of the map, randomly (white noise)
	map.generateHeight = () => {
		const rndLevel = (Math.random() - 0.5) * 2 * CONFIG.terrain.mapLevelRatio;	// from -1 to 1

		for (let x = 0; x < size.width; x++) {
			for (let y = 0; y < size.height; y++) {
				map[x][y].height = (Math.random() + rndLevel) * mapRange;
			}
		}
	};
	
	// MAP SMOOTH
	// Simulate erosion, by averaging cell heights
	map.smooth = (iterations) => {
		for (let n = 0; n < iterations; n++) {
			for (let x = 0; x < size.width; x++) {
				for (let y = 0; y < size.height; y++) {

					let xr = x === size.width - 1 ? 0 : x + 1;
					let yd = y === size.height - 1 ? 0 : y + 1;
					const avg = (map[x][y].height * mapErosion + 
											 map[xr][y].height + map[x][yd].height + 
											 map[xr][yd].height ) / (3 + mapErosion);

					map[x][y].height = avg;
				}
			}
		}
	};
	
	// IS VALID HEIGHT
	// Make the cell part of the graph or not, depending on height
	map.isValidCellHeight = (height) => {
		// Seas or mountains aren't valid
		return (height > (mapSeaLevel + 1) && height < 8);
	};
	
	// MAP GRAPH
	// Build the pathfinding graph, into the map
	map.generateGraph = () => {

		for (let x = 0; x < size.width; x++) {
			for (let y = 0; y < size.height; y++) {

				const hexOffset = HexOffset(x, y),
							hex = offset2Hex(hexOffset, mapTopped, mapParity),
							neighborsAll = hexNeighbors(hex),
							neighbors = [],
							costs = [],
							height = map[x][y].height;

				// Add the cell to graph if the height is valid
				map[x][y].isInGraph = map.isValidCellHeight(height);

				if (map[x][y].isInGraph) {

					// Each (eventual) neighbor of the cell
					for (let i = 0; i < 6; i++) {
						const n = neighborsAll[i],
									no = hex2Offset(n, mapTopped, mapParity);

						// Is the neighbor on/in the map?
						if (no.col >= 0	&& 
								no.row >= 0 && 
								no.col < size.width && 
								no.row < size.height ) {

							// Is the neighbor height valid?
							const neighborHeight = map[no.col][no.row].height;
							if ( map.isValidCellHeight(neighborHeight) ) {
								
								// EDGE COST
								// cost = destination height (path will try its best to stay low)
								const cost = Math.floor(neighborHeight - CONFIG.terrain.mapSeaLevel); 
								costs.push(cost);	// add the edge cost to the graph

								// ADD EGDE
								neighbors.push(n);
							}
						}
					}
				}

				// Backup things into cell
				map[x][y].hex = hex;
				map[x][y].hexOffset = hexOffset;
				map[x][y].neighbors = neighbors;
				map[x][y].costs = costs;
			}
		}
	};

	//////////////////////////////////////////////////////////////////////////////
	// PATH FINDING
	
	// As we have no string hex notation, we use hex objects as "indexes"
	// in a 2d array: [hex][value]
	
	// GET INDEX HEXES
	// Return an array of hexex from an array with theses hexes as indexes
	map.getIndexHexes = (cameFrom) => {
		const hexes = [];
		for (let h = 0; h < cameFrom.length; h++) {
			hexes.push( cameFrom[h][0] );
		};
		return hexes;
	};
	
	// FIND FROM HEX
	// Return a value from an hex index
	map.findFromHex = (data, hex) => {
		for (let h = 0; h < data.length; h++) {
			if ( hexEqual(data[h][0], hex) ) {
				return data[h][1];		
			}
		};
		return undefined;
	};
	
	// A-STAR PATHFINDING
	// Find a path between 2 hexes
	// From: 
	//	http://www.redblobgames.com/pathfinding/a-star/introduction.html
	//	http://www.redblobgames.com/pathfinding/a-star/implementation.html
	map.findPath = (start, goal, earlyExit = true) => {
		
		if (! map.getFromHex(start).isInGraph) console.warn("A*: start hex is NOT in graph!");
		if (! map.getFromHex(goal).isInGraph) console.warn("A*: goal hex is NOT in graph!");
				
		for (let y = 0; y < CONFIG.map.mapSize.height; y++) {
			for (let x= 0; x < CONFIG.map.mapSize.width; x++) {
				map[x][y].cost = 100000000;
			}
		}
		
		const frontier = PriorityQueue(); // List of the places still to explore
		const cameFrom = []; // List of where we've already been
		const costSoFar = [];	// The price we paid to go there
		let found = false;

		frontier.push(start, 0);
    cameFrom.push([start, undefined]);
		costSoFar.push([start, 0]);
		
		// LOOP
		while (frontier.length() > 0) {

			const current = frontier.pop();
			const currentHex = map.getFromHex(current);
			if (! currentHex.isInGraph) console.error("A*: current hex is NOT in graph!");

			// const	neighbors = shuffle(currentHex.neighbors);	// cheapo edge breaks
			const neighbors = currentHex.neighbors;
			const costs = currentHex.costs;

			if (goal) {
				if (hexEqual(current, goal)) {
					found = true;
					// Early exit (stop exploring map when goal is reached)
					if (earlyExit) break;
				}
			}
			
			for (let n = 0; n < neighbors.length; n++ ) {
				if (! map.getFromHex(neighbors[n]).isInGraph) console.error("argl!");

				const next = neighbors[n],
							nextCost = costs[n],
							newCost = map.findFromHex(costSoFar, current) // sum of the current cost...
											+ nextCost, // ...plus the cost of the next move
							cameFromHexes = map.getIndexHexes(cameFrom),
							comeSoFarHexes = map.getIndexHexes(costSoFar);
				
				if (!hexIndexOf(comeSoFarHexes, next) || newCost < costSoFar[next]) {
					costSoFar.push([next, newCost]);
					const priority = newCost + hexDistance(next, goal); // heuristic
					frontier.push(next, priority);
					cameFrom.push([next, current]);
					
					// Cost backup
					const nextOffset = hex2Offset(next);
					map[nextOffset.col][nextOffset.row].cost = Math.floor(newCost);
				}
			}
		}
		
		// BUILD PATH BACK FROM GOAL
		
		if (goal && found) {
			let current = goal;
			let path = [goal];
			
			while ( ! hexEqual(current, start) ) {
				current = map.findFromHex(cameFrom, current);
				path.push(current);
			}

			return path.reverse();
		} else {
			return undefined;
		}
	};	

	//////////////////////////////////////////

	// MAP GENERATE
	// Spawn a new map
	map.generate = () => {
		map.populate();
		map.generateHeight();
		map.smooth(CONFIG.terrain.mapSmoothing);
		map.generateGraph();
	};
	
	// Return the map
	return map;
};


////////////////////////////////////////////////////////////////////////////////
// ITEM

const Item = (name, color) => {
	const item = {};

	item.name = name;
	item.color = color;
	
	// mob.moveToHex = (hex, mapTopped, mapParity) => {
	// 	mob.hex = hex;
	// 	mob.hexOffset = hex2Offset(hex, mapTopped, mapParity);
	// };
	
	return item;
}

const MapItem = (name, color, hex) => {
	
	const mapItem = Object.assign( {}, Item(name, color) );
	mapItem.hex = hex;
	
	return mapItem;
}

// const item = Item("Item-1", "ff0000");
// console.log(item);

const mapItem = MapItem("MapItem-1", "0000ff", "hex");
console.log(mapItem);


////////////////////////////////////////////////////////////////////////////////
// MOB

// const Mob = (name, color, stats, weapon) => {
// 	const mob = {};

// 	Object.assign(mob, Item(name, color));
	
// 	mob.stats = stats;
// 	mob.weapon = weapon;
// 	mob.hp = stats.hpMax;
// 	mob.xp = 0;
	
// 	mob.moveToHex = (hex, mapTopped, mapParity) => {
// 		mob.hex = hex;
// 		mob.hexOffset = hex2Offset(hex, mapTopped, mapParity);
// 	};
	
// 	return mob;
// }

// const mob1 = Mob("Mob-1", "ff0000", stats, weapon);


////////////////////////////////////////////////////////////////////////////////
// PLAYERS

// TODO: multiple mobs for a player

/*
		http://fireemblem.wikia.com/wiki/Category:Game_Mechanics
		http://fireemblem.wikia.com/wiki/Battle_Formulas
		
*/

const Player = (name, color, stats, weapon) => {
	const player = {};

	player.name = name;
	player.color = color;
	player.stats = stats;
	player.weapon = weapon;
	player.hp = stats.hpMax;
	player.xp = 0;
	
	player.moveToHex = (hex, mapTopped, mapParity) => {
		player.hex = hex;
		player.hexOffset = hex2Offset(hex, mapTopped, mapParity);
	};
	
	return player;
}

const Players = (PLAYERS, mapTopped, mapParity, playerZoneRatio = 3) => {
	const players = [];
	
	for (let p = 0; p < PLAYERS.length; p++) {
		let player = Player(PLAYERS[p].name, PLAYERS[p].color, PLAYERS[p].stats, PLAYERS[p].weapon);
		let col, row;

		const randomCol = Math.random(),
					randomRow = Math.random(),
					colStart = Math.floor( CONFIG.map.mapSize.width * randomCol / playerZoneRatio ),
					rowStart = Math.floor( CONFIG.map.mapSize.height * randomRow / playerZoneRatio ),
					colEnd = Math.floor( CONFIG.map.mapSize.width * (1 - randomCol / playerZoneRatio) ),
					rowEnd = Math.floor( CONFIG.map.mapSize.height * (1 - randomRow / playerZoneRatio) );

		if (p === 0) { col = colStart; row =	rowStart; }
		else if (p === 1) {	col = colEnd; row = rowEnd; }		
		else if (p === 2) {	col = colStart; row = rowEnd; }		
		else if (p === 3) {	col = colEnd; row = rowStart; }		

		player.hexOffset = HexOffset(col,row);
		player.hex = offset2Hex(player.hexOffset, mapTopped, mapParity);

		players.push(player);
	}
	
	return players;
};


////////////////////////////////////////////////////////////////////////////////
// RENDERER

const Renderer = (game, CONFIG, ctx) => {
	const renderer = {};
	
	renderer.game = game;	// Backup game
	renderer.ctx = ctx;	// Backup ctx

	// COMPUTE MAP SCREEN ORIGIN

	renderer.mapComputeOrigin = (cellSize, mapTopped, mapParity, mapRange, mapRangeScale) => {
		const hexAspect = Math.sqrt(3)/2;	// width/height ratio of an hexagon
		const pespectiveRangeHeight = mapRange * mapRangeScale;
		let	mapOrigin = {};

		if (mapTopped === FLAT) {
			mapOrigin.x = cellSize.width;
			mapOrigin.y = mapParity === ODD ? 
				cellSize.height * Math.sqrt(3)/2 + pespectiveRangeHeight :
				cellSize.height * 2 * hexAspect + pespectiveRangeHeight

		} else if (mapTopped === POINTY) {
			mapOrigin.y = cellSize.height + pespectiveRangeHeight;
			mapOrigin.x = mapParity === ODD ? 
				cellSize.width * hexAspect : 
				cellSize.width * 2 * hexAspect;
		}

		return {
			x: Math.round(mapOrigin.x),
			y: Math.round(mapOrigin.y)
		};
	};

	// COMPUTE MAP SCREEN SIZE

	renderer.mapComputeSize = (mapSize, cellSize, mapTopped, mapDeepness, mapRange, mapRangeScale) => {

		const hexAspect = Math.sqrt(3)/2;	// width/height ratio of an hexagon
		const perspectiveHeight = mapDeepness + mapRange * mapRangeScale;

		const	mapRenderSize = mapTopped === FLAT ?
			{
				width:  (mapSize.width  + 1/3) * 2 * 3/4 * cellSize.width,
				height: (mapSize.height + 1/2) * 2 * cellSize.height * hexAspect + perspectiveHeight
			} : {
				width:  (mapSize.width  + 1/2) * 2 * cellSize.width * hexAspect,
				height: (mapSize.height + 1/3) * 2 * 3/4 * cellSize.height + perspectiveHeight
			};

		return {
			width: Math.round(mapRenderSize.width),
			height: Math.round(mapRenderSize.height)
		};
	};

	// PLOT CURSOR
	
	renderer.plotCursor = (e) => {
		const cursor = hexRound( pixel2Hex( renderer.layout, Point(
			e.x - renderer.canvasOffset.x,
			e.y - renderer.canvasOffset.y + CONFIG.render.mapDeepness + CONFIG.render.mapRangeScale * CONFIG.terrain.mapSeaLevel	// TODO - better mapping
		)));

		return cursor;
	}

	// GET TERRAIN COLOR
	
	renderer.getTerrainColor = (val) => {
		// Cell terrain color
		let color;
		if (val > 11) 			color = "#ccffff";	// 11: ice
		else if (val > 10) 	color = "#ffffff";	// 10: snow
		else if (val > 9) 	color = "#aaaaaa";	//  9: high mountain

		else if (val > 8) 	color = "#666666";	//  8: mountain
		else if (val > 7) 	color = "#003300";	//  7: deep forest
		else if (val > 6) 	color = "#006600";	//  6: forest

		else if (val > 5) 	color = "#449900";	//  5: bush
		else if (val > 4) 	color = "#88cc00";	//  4: grass
		else if (val > 3) 	color = "#eeee44";  //  3: beach

		else if (val > 2) 	color = "#0000ff";	//  2: "light" sea
		else if (val > 1) 	color = "#0000cc";	//  1: sea
		else 								color = "#000088";	//  0: deep sea

		return color;
	};
	
	// Z-SORTING (*kind of*)

	renderer.zIndexSort = (index, total, mapParity) => {
		let x;
		if (total % 2 === 1) {
			x = mapParity === EVEN ? index * 2 + 1 : x = index * 2;
			if (x >= total) x -= total;

		} else {
			if (mapParity === EVEN) {
				x = index * 2 + 1;
				if (x >= total) x -= total + 1;
			} else {
				x = index * 2;
				if (x >= total) x -= total - 1;
			}
		}

		return x;
	};

	
	// DRAW POLYGON
	
	renderer.drawPolygon = (corners, h = 0, color = "#ffffff") => {

		// Stroke style
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeStyle = "rgba(0,0,0,0.125)";

		// Fill style
		renderer.ctx.fillStyle = color;

		renderer.ctx.beginPath();
		renderer.ctx.moveTo(corners[0].x, corners[0].y + h);

		for (let c = 1; c < corners.length; c++) {
			renderer.ctx.lineTo(corners[c].x, corners[c].y + h);
		}

		renderer.ctx.lineTo(corners[0].x, corners[0].y + h);
		renderer.ctx.closePath();

		renderer.ctx.fill();
		renderer.ctx.stroke();
	};

	// DRAW HEXAGON

	renderer.drawHex = (corners, h, color) => {
		renderer.drawPolygon(
			[ corners[0], corners[1], corners[2], corners[3], corners[4], corners[5] ],
			h,
			color
		);
	};
	
	// DRAW HEX SIDES
	
	renderer.drawHexSides = (corners, h, h2, color) => {

		// Front-right side
		renderer.drawPolygon( [
			{x: corners[0].x, y: corners[0].y + h}, 
			{x: corners[0].x, y: corners[0].y + h2}, 
			{x: corners[1].x, y: corners[1].y + h2}, 
			{x: corners[1].x, y: corners[1].y + h}
		], 0, shadeBlend(-0.25, color));

		// Front-left side (void if POINTY)
		if (CONFIG.map.mapTopped !== "pointy") {
			renderer.drawPolygon( [
				{x: corners[2].x, y: corners[2].y + h}, 
				{x: corners[2].x, y: corners[2].y + h2}, 
				{x: corners[3].x, y: corners[3].y + h2}, 
				{x: corners[3].x, y: corners[3].y + h}
			], 0, shadeBlend(0.25, color));
		}

		// Front (front-left side if POINTY)
		renderer.drawPolygon( [
			{x: corners[1].x, y: corners[1].y + h}, 
			{x: corners[1].x, y: corners[1].y + h2}, 
			{x: corners[2].x, y: corners[2].y + h2}, 
			{x: corners[2].x, y: corners[2].y + h}
		], 0, CONFIG.map.mapTopped !== "pointy" ? 
			shadeBlend(0.0, color) : // middle
			shadeBlend(0.25, color) ); // left
	};
	
	// DRAW HEX TOP
	
	renderer.drawHexTop = (corners, h, color) => {
		renderer.ctx.fillStyle = color;
		renderer.drawHex(corners, h, color);
	};
	
	// DRAW HEX MESH
	
	renderer.drawHexMesh = (corners, h, h2, color) => {

		// Draw sides
		if (CONFIG.render.mapHasPerspective) {
			renderer.drawHexSides(corners, h, h2, color);
		}
		// Draw top
		renderer.drawHexTop(corners, h, color);
	};
	
	// DRAW HEX BASE
	
	renderer.drawHexBase = (corners, cornersCore, h, h2, color) => {

		renderer.drawHexMesh(corners, h, h2, "#444444");
		renderer.drawHexMesh(cornersCore, h, h + 2, color);
	};
	
	
	////////////////////////////////////////////////////////////////////////////////
	// DRAW MAP

	renderer.drawMap = (ctx, mapTopped, mapParity, mapDeepness, mapRangeScale) => {

		// COMPUTE UI OVERLAY

		const ui = game.ui;
		const cursor = game.ui.cursor;

		// Cursor path
		cursorPath = undefined;
		if (game.map.getFromHex(cursor) && game.map.getFromHex(cursor).isInGraph) {
			cursorPath = game.map.findPath( game.players[1].hex, cursor );
		}

		// CLEAR CANVAS
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// MAP LOOP
		for (let y = 0; y < CONFIG.map.mapSize.height; y++) {
			for (let xi= 0; xi < CONFIG.map.mapSize.width; xi++) {

				// Display front cells first
				let x = renderer.zIndexSort(xi, CONFIG.map.mapSize.width, mapParity);

				// Cell variables
				const val = game.map[x][y].height,
							valFlooded = Math.max(val, CONFIG.terrain.mapSeaLevel),
							valFloor = Math.floor(val),

							offset = HexOffset(x, y),
							hex = offset2Hex( offset, CONFIG.map.mapTopped, CONFIG.map.mapParity ),

							point = hex2Pixel(renderer.layout, hex),
							corners = hexCorners(renderer.layout, hex),
							cornersOneThird = hexCorners(renderer.layout, hex, 0.3332),
							cornersHalf = hexCorners(renderer.layout, hex, 0.5),
							cornersTwoThird = hexCorners(renderer.layout, hex, 0.6667),
							
							color = renderer.getTerrainColor(val), // Cell color
							h = CONFIG.render.mapHasPerspective ? 
								- Math.floor(valFlooded) * mapRangeScale : 0; // Cell height


				////////////////////////////////////
				// DRAW

				// Draw terrain mesh
				renderer.drawHexMesh(corners, h, mapDeepness, color);


				// ON-MAP UI

				// Drawline
				for (let i = 0; i < ui.line.length; i++) {
					if (hexEqual(hex, ui.line[i]))  {
						renderer.drawHexTop(cornersHalf, h, game.players[1].color);
					}
				}

				// Draw cursor path
				if (cursorPath) {
					for (let i = 0; i < cursorPath.length; i++) {
						if (hexEqual(hex, cursorPath[i]))  {
							renderer.drawHexTop(cornersHalf, h, "#0080ff");
						}
					}
				}

				// Cursor
				if (hexEqual(hex, cursor)) {
					renderer.drawHexTop(corners, h,  game.players[0].color);
				};

				// Players
				if (game.players) {
					for (let p = 0; p < game.players.length; p++) {
						if (hexEqual(hex, game.players[p].hex)) {
							// renderer.drawHexTop(corners, h, game.players[p].color);
							// Draw terrain mesh 
							renderer.drawHexBase(cornersTwoThird, cornersOneThird, h - 20, h, game.players[p].color);
						}
					}
				}


				// CELL TEXT

				ctx.font = "10px Arial";
				ctx.lineWidth = 0;
				ctx.fillStyle = "rgba(255,255,255,0.5)";

				// Write in black on light terrain colors
				if (valFloor === 11 || valFloor === 10 || valFloor === 9 || valFloor === 3 ) {
					ctx.fillStyle = "rgba(0,0,0,0.75)";	
				}

				// ctx.fillText(valFloor, point.x - 3, point.y + 3 + h);	// display height
				if (game.map[x][y].cost < 1000000) {
					ctx.fillText(game.map[x][y].cost, point.x - 3, point.y + 3 + h);
				}

			}
		}

	}
	

	// INIT OTHER THINGS

	renderer.init = () => {

		// Map origin
		renderer.mapOrigin = renderer.mapComputeOrigin(
			CONFIG.render.cellSize, 
			CONFIG.map.mapTopped, 
			CONFIG.map.mapParity, 
			CONFIG.terrain.mapRange, 
			CONFIG.render.mapRangeScale
		);

		// Map render size
		renderer.mapRenderSize = renderer.mapComputeSize(
			CONFIG.map.mapSize, 
			CONFIG.render.cellSize, 
			CONFIG.map.mapTopped, 
			CONFIG.render.mapDeepness, 
			CONFIG.terrain.mapRange, 
			CONFIG.render.mapRangeScale
		);

		// Layout
		renderer.layout = Layout(
			CONFIG.map.mapTopped ? orientationFlat : orientationPointy, // topped
			{ x: CONFIG.render.cellSize.width, y: CONFIG.render.cellSize.height }, // cell size in px
			renderer.mapOrigin // origin
		);
	};

	
	renderer.init();
	
	return renderer;
};


////////////////////////////////////////////////////////////////////////////////
// GAME

const Game = (CONFIG, ctx) => {
	const game = {};
	
	game.onUIClick = (hex) => {
		const line = game.map.findPath( game.players[0].hex, hex );
		if (line) {
			game.players[0].moveToHex(hex);		
			game.ui.line = game.map.findPath( game.players[0].hex, game.players[1].hex );
		}
	};
	
	// GAME MAP
	game.map = Map(
		CONFIG.map.mapSize, 
		CONFIG.map.mapTopped, 
		CONFIG.map.mapParity, 
		CONFIG.terrain.mapLevelRatio, 
		CONFIG.terrain.mapRange, 
		CONFIG.terrain.mapErosion, 
		CONFIG.terrain.mapSeaLevel,
		game.ui
	);
	
	// GAME RENDERER
	game.renderer = Renderer(game, CONFIG, ctx);
	
	// UI OVERLAY
	game.ui = {};
	game.ui.cursor = Hex(-1, -1); // out of bound cursor
	game.ui.line = [];
	game.ui.cursorPath = [];
	
	// GENERATE
	game.generate = () => {
		const map = game.map;
		let line = undefined;
		
		while (!line) {
			// PLAYERS
			game.players = Players(
				CONFIG.players, 
				CONFIG.map.mapTopped, 
				CONFIG.map.mapParity, 
				CONFIG.rules.playerZoneRatio
			);
			map.generate();
			// Try to draw a path between the two first players
			line = map.findPath( game.players[0].hex, game.players[1].hex );
		}
		
		game.ui.line = line;
	};

	return game;
};



////////////////////////////////////////////////////////////////////////////////
// LIVE

window.onload = () => {

	console.warn("*** GO! ***");

	// DOM THINGS
	
	const	canvas = document.getElementById('canvas'),
				generateBtn = document.getElementById('generate'),
				nextBtn = document.getElementById('next');


	// USER INPUT EVENTS

	canvas.addEventListener('mousemove', (e) => { 
		const cursor = game.renderer.plotCursor(e);
		if (! hexEqual(cursor, game.ui.cursor)) {
			game.ui.cursor = cursor;
			render();	
		}
		
	}); 

	canvas.addEventListener('click', (e) => { 
		// game.ui.cursor = game.renderer.plotCursor(e);
		game.onUIClick(game.renderer.plotCursor(e));
		render();
	}); 

	generateBtn.addEventListener('click', () => { 
		game.generate();
		render();
		step = 0;
	}); 

	nextBtn.addEventListener('click', () => { 
		gameStep();
		render();
	}); 

	
	// THE GAME
	
	const ctx = canvas.getContext('2d');

	const game = Game(CONFIG, ctx);
	game.generate();

	// Set canvas size
	canvas.width  = game.renderer.mapRenderSize.width;
	canvas.height = game.renderer.mapRenderSize.height;

	// Get canvas offset (from top-left viewport corner)
	// (the canvas is supposed to be positionned in CSS)
	game.renderer.canvasOffset = {
		x: canvas.offsetLeft,
		y: canvas.offsetTop
	}
	
		
	// ANIMATION LOOP
	
	// let startTime = undefined,
	// 		time, 
	// 		deltaT;

	const render = () => {
		// time = Date.now();
		// if (startTime === undefined) startTime = time;
		// deltaT = time - startTime;

		// console.log(game);
		// drawMap(
		game.renderer.drawMap(
			ctx, 
			CONFIG.map.mapTopped,
			CONFIG.map.mapParity,
			CONFIG.render.mapDeepness, 
			CONFIG.render.mapRangeScale);
	}

	// LAUCH LOOP
	
	// (function animloop(){
	// 	render();
	// 	window.requestAnimationFrame(animloop);
	// })();
	
	// Initial rendering
	render();
	
	
	////////////////////////////////////////////////////////////////////////////////
	// PLAYGROUND!!!

	let step = 0;

	// COMPUTE FIGHT STATS
	const getFightStats = (p1, p2) => {
		const stats = {};
		
		stats.speed = p1.stats.speed - Math.max(p1.weapon.weight - p1.stats.strength, 0);
		stats.defenseSpeed = p2.stats.speed - Math.max(p2.weapon.weight - p2.stats.strength, 0);
		stats.double = (stats.speed - stats.defenseSpeed) > 4 ? true : false;

		stats.attack = p1.stats.strength + p1.weapon.power; // or magic
		stats.defense = p2.stats.defense; // or resistance
		stats.damage = Math.max(stats.attack - stats.defense, 0);

		stats.hitRate	= p1.weapon.hit + p1.stats.skill * 2 + p1.stats.luck / 2;
		stats.evadeRate = stats.defenseSpeed + p2.stats.luck / 2; // + Terrain Bonus
		stats.hit	= stats.hitRate - stats.evadeRate; // + Triangle Bonus

		stats.criticalRate = p1.weapon.critical + p1.stats.skill / 2;
		stats.criticalEvade	= p2.stats.luck;
		stats.criticalHit	= stats.criticalRate - stats.criticalEvade;
		stats.criticalDamage = stats.attack * 2 - stats.defense;

		// console.log(p1.name + " - " + p1.weapon.name + " - HP: " + p1.hp + "/" + p1.stats.hpMax + " - DMG: " + stats.damage + (stats.double ? " (x2)" : "     ") + " - HIT: " + Math.floor(stats.hit) + "%   - CRT: " + Math.floor(stats.criticalHit) + "%");
				
		return stats;
	}
	
	// ONE PLAYER HITS ANOTHER
	const hit = (p1, p2, attack, defense) => {
		const criticalHitten	= ((Math.random() * 100) < attack.criticalHit) ? true : false;
		const hitten	= ((Math.random() * 100) < attack.hit) ? true : false;

		if (criticalHitten) {
			console.log(p1.name + " makes a critical!!! " + attack.criticalDamage + " damage!");
			p2.hp -= attack.criticalDamage;
		} else if (hitten) {
			if (attack.damage === 0) {
				console.log(p1.name + " hits, but no damage!");
			} else {
				console.log(p1.name + " hits " + p2.name + " with " + attack.damage + " damage.");
				p2.hp -= attack.damage;
			}
		} else {
			console.log(p1.name + " miss!");
		}
		
		console.log(p2.name + " - " + p2.hp + "/" + p2.stats.hpMax);
		
		if (p2.hp <= 0) console.log(p2.name + " died!!!");
		
	};
	
	// ONE PLAYER ATTACKS ANOTHER (who counterattacks)
	const fight = (p1, p2) => {
		const attack = getFightStats(game.players[0], game.players[1]);
		const defense = getFightStats(game.players[1], game.players[0]);
		
		hit(p1, p2, attack, defense);	// Attack
		if (p1.hp > 0 && p2.hp > 0) hit(p2, p1, defense, attack);	// Counter-attack

		if (p1.hp > 0 && p2.hp > 0 && attack.double) {	// Double attack
			hit(p1, p2, attack, defense);
		} else if (p1.hp > 0 && p2.hp > 0 && defense.double) {	// Double counter-attack
			hit(p2, p1, defense, attack);
		}
	};
	
	
	const gameStep = () => {
		step++;
		// console.log("Step " + step);
		
		const p1 = game.players[0];
		const p2 = game.players[1];
		
		fight(p1, p2);
		if (p1.hp > 0 && p2.hp > 0) fight(p2, p1);
		

		
		
		// for (let p = 0; p < game.players.length; p++) {
		// 	const player = game.players[p];
		// 	console.log("Player: " + player.name + " - HP : " + player.hp + "/" + player.stats.hpMax);
		// 	console.log("  attacks with " + player.weapon.name);
		// 	// console.log(player);
		// }

		// const path = game.map.findPath( game.players[0].hex, game.players[1].hex );
		// // console.log("Distance: " + path.length);
		// game.players[0].moveToHex(path[0 + 1], CONFIG.map.mapTopped, CONFIG.map.mapParity);
		// game.players[1].moveToHex(path[path.length - 1 - 1], CONFIG.map.mapTopped, CONFIG.map.mapParity);
	}
      
};	
	

