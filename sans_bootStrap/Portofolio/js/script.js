
// Canvas pricipal

//Création de l'engine
var canvas = document.getElementById("gameCanvas");
var engine = new BABYLON.Engine(canvas, true);
//Création de la scène
var scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0, 0, 0.1); // BackGround Color
/* COLORS:
  |___RGB___  | ___HEXA___ | ______ID______|
  |0, 0, 0.1 ->  #101023   -> darkBlue     |
  |----------------------------------------|
  |152,61,63 ->  #983D3F   -> Red(h1)      |
  |----------------------------------------|
  |17,47,55  ->  #112F37   ->Black(id BckG)|
  |----------------------------------------|
  |176,137,183-> #B089C1   -> Violet       |
  |########################################|


*/  
//============================================================================================

// camera // (nom, angle_alpha, angle_beta, rayon, point_visé, scene);
var camera = new BABYLON.FreeCamera("camera",new BABYLON.Vector3(0,0,-10),scene);// Pour indiquer une position dans l'espace, il est nécessaire de créer un objet de type "Vector3" 
camera.setTarget(BABYLON.Vector3.Zero());                     
// lumière
var light = new BABYLON.HemisphericLight("light",new BABYLON.Vector3(1,1,1),scene);//new BABYLON.PointLight(nom,position, scene);

// meshes cubes                                                           
var cube0 = BABYLON.Mesh.CreateBox("Box0", 1,scene);
var cube1 = BABYLON.Mesh.CreateBox("Box1", 1,scene);
var cube2 = BABYLON.Mesh.CreateBox("Box1", 1,scene);
// textures meshes
var mat = new BABYLON.StandardMaterial("texture0",scene);
mat.diffuseColor = new BABYLON.Color3(0, 0.5, 0.5);
mat.wireframe = true;
cube0.material = mat;

var mat = new BABYLON.StandardMaterial("texture1",scene);
mat.diffuseColor = new BABYLON.Color3(0, 0.5, 0.5);
mat.wireframe = true;
cube1.material = mat;

var mat = new BABYLON.StandardMaterial("texture2",scene);
mat.diffuseColor = new BABYLON.Color3(0, 0.5, 0.5);
mat.wireframe = true;
cube2.material = mat;
// brouillard & couleur
scene.fogMode = BABYLON.Scene.FOGMODE_EXP
scene.fogColor = new BABYLON.Color3(0.2, 0.6, 0.70);

//============================================================================================

/*****************************\
** ROTATION/POSITIONS assets **
\*****************************/

//cube0
// mesh rotation (z axis) + mesh position 
cube0.rotation.z = Math.PI/4;
cube0.position = new BABYLON.Vector3(0, 0, -2);

// Rotation
cube0.registerBeforeRender(function(){
		cube0.rotation.y += 0.01; 
});

//cube1
cube1.rotation.z = Math.PI/4;
cube1.position = new BABYLON.Vector3(0, 0, -3);

cube1.registerBeforeRender(function(){
		cube1.rotation.y += 0.03;
});

//cube2
cube2.rotation.z = Math.PI/4;
cube2.position = new BABYLON.Vector3(0, 0, -2);

cube2.registerBeforeRender(function(){
		cube2.rotation.y += 0.02;
});

//====================================================

/*****************************\
********** CONTROLS  **********   
\*****************************/

// controles touches direction. & mouse      

//====================================================

/*****************************\
*********** MODALS ************    
\*****************************/

// Creation du canvas 2D
var canvas = new BABYLON.ScreenSpaceCanvas2D(scene, {
        id: "ScreenCanvas", backgroundFill: "#40404040",
        backgroundRadius: 10
});

var cb = function (ppi, es) {
        //console.log("Target: " + ppi.relatedTarget.id +", Event State: " + es.mask);
};

// Button 
var button1 = new BABYLON.Rectangle2D( {
          parent: canvas, id: "button", x: 60, y: 100,
          width: 40, height: 40,
          fill: "#40404040",
          children:              
          [
            new BABYLON.Text2D("x", { marginAlignment: "h: center, v: center", fontName: "40pt EM-Decima.Mono.Pro"})
          ]
});

    button1.pointerEventObservable.add(cb);
// Modal
var modal = new BABYLON.Rectangle2D( {
          parent: canvas, id: "modal", x: 210, y: 100, width: 350, height: 500,
          fill: "#40404040",
          roundRadius: 1,
          isVisible: false,
          children:
          [                        
            new BABYLON.Text2D("PROJECT 001 Cum haec taliaque sollicitas" 
                , { marginAlignment: "h: center, v: center", fontName: "5pt EM-Decima.Mono.Pro"})
          ]
});
    button1.pointerEventObservable.add(function (d, s) {
        modal.levelVisible = !modal.levelVisible;
        console.log("UP");
    }, BABYLON.PrimitivePointerInfo.PointerUp);
 


/*var createScene = function() {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 12, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);

    create(scene);
   
};  */
// Modal
//var modal = document.getElementById('myModal');
//var btn = document.getElementById("myBtn");
//var span = document.getElementsByClassName("close")[0];

//open modal 
//btn.onclick = function() {
    //modal.style.display = "block";
//}

//close
//span.onclick = function() {
    //modal.style.display = "none";
//}

//close(screen)
//window.onclick = function(event) {
    //if (event.target == modal) {
        //modal.style.display = "none";
    //}
//}

//====================================================

/*****************************\
******** BOUCLE DE JEU ********
\*****************************/ 

engine.runRenderLoop(function(){
		scene.render();
});	

/*****************************\
********* REDIMENSION *********
\*****************************/

window.addEventListener("resize", function () { // redimension screen
        engine.resize();
});


