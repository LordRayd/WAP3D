var scene
var renderer
var camera

var framerateTimeReference
var currentScreenFrameTime = 0.01667

/**
 * Permet de récupérer le frame time en secondes
 * approximatif de la page à l'instant T
 */
function updateFrameTime() {

    if (!framerateTimeReference) {
        framerateTimeReference = Date.now();
    } else {
        let delta = (Date.now() - framerateTimeReference) / 1000;
        framerateTimeReference = Date.now();
        currentScreenFrameTime = delta;
    }
}


/**
 * Créé et lance le player avec uniquement une grille de reférence
 */
function initialisePlayer() {

    document.getElementById('fileSelector').addEventListener('change', associateBVH)

    scene = new THREE.Scene()

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(document.getElementById("player").offsetWidth, document.getElementById("player").offsetHeight)
    document.getElementById("player").appendChild(renderer.domElement)
    window.onresize = _ => { renderer.setSize(document.getElementById("player").offsetWidth, document.getElementById("player").offsetHeight) }

    camera = new THREE.PerspectiveCamera(90, document.getElementById("player").offsetWidth / document.getElementById("player").offsetHeight, 0.1, 1000)
    camera.position.z = 150
    camera.position.y = 150
    camera.lookAt(0, 150, 0)

    let referenceGrid = new THREE.GridHelper(1000, 50);
    scene.add(referenceGrid);

    renderer.render(scene, camera)
}