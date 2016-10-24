
// PETIT canvas navBlock

//Création de l'engine
var canvas2 = document.getElementById("blockScanvas");
var engine2 = new BABYLON.Engine(canvas2, true);
//Création de la scène
var scene2 = new BABYLON.Scene(engine2);
scene2.clearColor = new BABYLON.Color3(0, 0, 0.1); // BackGround Color

//============================================================================================

// camera // (nom, angle_alpha, angle_beta, rayon, point_visé, scene);
var camera2 = new BABYLON.FreeCamera("camera",new BABYLON.Vector3(0,0,-10),scene2);// Pour indiquer une position dans l'espace, il est nécessaire de créer un objet de type "Vector3" 
camera2.setTarget(BABYLON.Vector3.Zero());                     
// lumière
var light2 = new BABYLON.HemisphericLight("light",new BABYLON.Vector3(1,1,1),scene2);//new BABYLON.PointLight(nom,position, scene);

// meshes cubes                                                           
var cube4 = BABYLON.Mesh.CreateBox("Box4", 1,scene2);
var cube5 = BABYLON.Mesh.CreateBox("Box5", 1,scene2);
var cube6 = BABYLON.Mesh.CreateBox("Box6", 1,scene2);
// textures meshes
var mat4 = new BABYLON.StandardMaterial("texture4",scene2);
mat.diffuseColor = new BABYLON.Color3(0, 0.5, 0.5);
mat4.wireframe = true;
cube4.material = mat4;

var mat5 = new BABYLON.StandardMaterial("texture5",scene2);
mat5.diffuseColor = new BABYLON.Color3(0, 0.5, 0.5);
mat5.wireframe = true;
cube5.material = mat5;

var mat6 = new BABYLON.StandardMaterial("texture6",scene2);
mat6.diffuseColor = new BABYLON.Color3(0, 0.5, 0.5);
mat6.wireframe = true;
cube6.material = mat6;
// brouillard & couleur
scene.fogMode = BABYLON.Scene.FOGMODE_EXP
scene.fogColor = new BABYLON.Color3(0.2, 0.6, 0.70);

//============================================================================================

/*****************************\
** ROTATION/POSITIONS assets **
\*****************************/

//cube4
// mesh rotation (z axis) + mesh position 
cube4.rotation.z = Math.PI/4;
cube4.position = new BABYLON.Vector3(0, 0, -2);

// Rotation
cube4.registerBeforeRender(function(){
		cube4.rotation.y += 0.01; 
});

//cube5
cube5.rotation.z = Math.PI/4;
cube5.position = new BABYLON.Vector3(0, 0, -3);

cube5.registerBeforeRender(function(){
		cube5.rotation.y += 0.03;
});

//cube6
cube6.rotation.z = Math.PI/4;
cube6.position = new BABYLON.Vector3(0, 0, -2);

cube6.registerBeforeRender(function(){
		cube6.rotation.y += 0.02;
});

//====================================================

/*****************************\
******** BOUCLE DE JEU ********
\*****************************/ 

engine2.runRenderLoop(function(){
		scene2.render();
});	

/*****************************\
********* REDIMENSION *********
\*****************************/

window.addEventListener("resize", function () { // redimension screen
        engine1.resize();
});