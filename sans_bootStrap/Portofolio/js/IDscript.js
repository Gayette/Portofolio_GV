
// Petit canvas block ID

//Création de l'engine
var canvas1 = document.getElementById("blockCanvas");
var engine1 = new BABYLON.Engine(canvas1, true);
//Création de la scène
var scene1 = new BABYLON.Scene(engine1);
scene1.clearColor = new BABYLON.Color3(0, 0, 0.1); // BackGround Color

//============================================================================================

// camera // (nom, angle_alpha, angle_beta, rayon, point_visé, scene);
var camera1 = new BABYLON.FreeCamera("camera",new BABYLON.Vector3(0,0,-10),scene1);// Pour indiquer une position dans l'espace, il est nécessaire de créer un objet de type "Vector3" 
camera1.setTarget(BABYLON.Vector3.Zero());                     
// lumière
var light1 = new BABYLON.HemisphericLight("light",new BABYLON.Vector3(1,1,1),scene1);//new BABYLON.PointLight(nom,position, scene);

// meshes cubes                                                           
var cube = BABYLON.Mesh.CreateBox("Box", 3,scene1);

// textures meshes
var mat1 = new BABYLON.StandardMaterial("texture",scene1);
mat1.diffuseColor = new BABYLON.Color3(0, 0.5, 0.5);
mat1.wireframe = true;
cube.material = mat1;

// brouillard & couleur
scene1.fogMode = BABYLON.Scene.FOGMODE_EXP
scene1.fogColor = new BABYLON.Color3(0.2, 0.6, 0.70);

//====================================================

/*****************************\
** ROTATION/POSITIONS assets **
\*****************************/

//cube
// mesh rotation (z axis) + mesh position 
cube.rotation.z = Math.PI/4;
cube.position = new BABYLON.Vector3(0, 0, 2);

// Rotation
cube.registerBeforeRender(function(){
		cube.rotation.y += 0.01; 
});

//====================================================

/*****************************\
******** BOUCLE DE JEU ********
\*****************************/ 

engine1.runRenderLoop(function(){
		scene1.render();
});	

/*****************************\
********* REDIMENSION *********
\*****************************/

window.addEventListener("resize", function () { // redimension screen
        engine1.resize();
});