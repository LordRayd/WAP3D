var scene
var renderer
var camera
var mouseControls

var framerateTimeReference
var currentScreenFrameTime = 0.01667

// [ [SkeletonHelper, AnimationMixer, frameTime], [SkeletonHelper, AnimationMixer, frameTime], ...]
var bvhAnimationsArray = []

/**
 * TODO
 * problème: comment gérer la barre quand il y'a plusieurs animations ?
 */
function advanceTimeBar() {
    console.log(":)")
}

/**
 * TODO 
 */
function clickOnPlayAction() {
    console.log(":)")
}

/**
 * TODO
 */
function clickOnReplayAction() {
    console.log(":)")
}

/**
 * Permet de récupérer le frame time du navigateur en secondes
 * Estimation approximative à l'instant T
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
 * Initialise le lecteur avec une grille de référence
 * Joue les animations quand elles existent
 * Initialise les interactions à la souris et au clavier
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

    mouseControls = new THREE.TrackballControls(camera, renderer.domElement)
    mouseControls.keys = [17, 83, 16]//ctrl (rotate); scroll (dezoom); shift(translate)

    let c = false
    function animate() {
        bvhAnimationsArray.forEach(bvh => {
            bvh[1].timeScale = currentScreenFrameTime / bvh[2]
            bvh[1].update(bvh[2])
            /*
            if (c == false) {
                bvh[0].material.linewidth += 0.2
                if (bvh[0].material.linewidth >= 4) {
                    c = true
                }
            }
            if (c == true) {
                bvh[0].material.linewidth -= 0.2
                if (bvh[0].material.linewidth <= 0.05) {
                    c = false
                }
            }
            */
        });

        requestAnimationFrame(animate)
        updateFrameTime()
        renderer.render(scene, camera)
        mouseControls.update()
    }
    animate()
}