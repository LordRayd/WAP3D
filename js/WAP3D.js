var scene, renderer, camera, mouseControls

var framerateTimeReference
var currentScreenFrameTime = 0.01667
    // [ [SkeletonHelper, AnimationMixer, frameTime], [SkeletonHelper, AnimationMixer, frameTime], ...]
var bvhAnimationsArray = []

/**
 * problème: comment gérer la barre quand il y'a plusieurs animations ?
 */
function advanceTimeBar() {
    // TODO
}

/**
 * TODO 
 */
function clickOnPlayAction() {
    // TODO
}

/**
 * TODO
 */
function clickOnReplayAction() {
    // TODO
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
$(function initialisePlayer() {
    $('#fileSelector').bind("change", associateBVH)

    scene = new THREE.Scene()

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize($("#player")[0].offsetWidth, $("#player")[0].offsetHeight)
    $("#player").append(renderer.domElement)
    window.onresize = _ => { renderer.setSize($("#player")[0].offsetWidth, $("#player")[0].offsetHeight) }

    camera = new THREE.PerspectiveCamera(90, $("#player")[0].offsetWidth / $("#player")[0].offsetHeight, 0.1, 1000)
    camera.position.z = 150
    camera.position.y = 150
    camera.lookAt(0, 150, 0)

    let referenceGrid = new THREE.GridHelper(1000, 50);
    scene.add(referenceGrid);

    mouseControls = new THREE.TrackballControls(camera, renderer.domElement)
    mouseControls.keys = [17, 83, 16] //[ctrl, scroll, shift] -> [rotate, dezoom, translate]

    animate()
})

function animate() {
    //requestAnimationFrame(animate)
    if (getLoadingState() !== "loading") {
        requestAnimationFrame(animate)
        $("#messagePlayer").hide("")
        mouseControls.update()
        if (getLoadingState() === "loaded") {
            bvhAnimationsArray.forEach(bvh => {
                bvh[1].timeScale = currentScreenFrameTime / bvh[2]
                bvh[1].update(bvh[2])
            });
            updateFrameTime()
        }
    } else {
        $("#messagePlayer").show()
    }
    renderer.render(scene, camera)
}

function testCallBack() {
    requestAnimationFrame(animate)
}