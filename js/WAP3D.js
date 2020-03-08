let scene, renderer, camera, mouseControls
let framerateTimeReference = -1
let currentScreenFrameTime = 0.01667
let playAnimation = true
    // [ [SkeletonHelper, AnimationMixer, frameTime], [SkeletonHelper, AnimationMixer, frameTime], ...]
let bvhAnimationsArray = []
const initialCameraPosition = 150

/**
 * Permet de récupérer le frame time du navigateur en secondes
 * Estimation approximative à l'instant T
 */
function updateFrameTime() {
    if (framerateTimeReference == -1) {
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

    scene = new THREE.Scene()

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize($("#player")[0].offsetWidth, $("#player")[0].offsetHeight)
    $("#player").append(renderer.domElement)
    window.onresize = _ => { renderer.setSize($("#player")[0].offsetWidth, $("#player")[0].offsetHeight) }

    camera = new THREE.PerspectiveCamera(90, $("#player")[0].offsetWidth / $("#player")[0].offsetHeight, 0.1, 1000)
    camera.position.z = initialCameraPosition
    camera.position.y = initialCameraPosition

    let referenceGrid = new THREE.GridHelper(1000, 50);
    scene.add(referenceGrid);

    mouseControls = new THREE.OrbitControls(camera, renderer.domElement)
    mouseControls.enableKeys = true
    mouseControls.rotateSpeed = 0.3
    mouseControls.keyPanSpeed = 25
    mouseControls.screenSpacePanning = false // Défini si le translate se fait par rapport à (X,Z) ou par rapport à la caméra
    mouseControls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE, //rotate
        MIDDLE: THREE.MOUSE.DOLLY, //zoom
        RIGHT: null
    }
    mouseControls.keys = {
        LEFT: 81, // q
        UP: 90, // z
        RIGHT: 68, // d
        BOTTOM: 83 // s
    }

    inputEventManager()

    animate()
})

/** TODO */
function animate() {
    if (playAnimation === true) {
        if (getLoadingState() !== "loading") {
            requestAnimationFrame(animate)
            $("#messagePlayer").hide()
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
    } else {
        return
    }
}

/** TODO */
function fileLoadedCallBack() {
    requestAnimationFrame(animate)
    $("#fileSelector").one("change", event => associateBVH(event, scene, bvhAnimationsArray))
    $("#play").on("click", clickOnPlayAction)
    $("#replay").on("click", clickOnReplayAction)
    $("#time-slider").on("change", advanceTimeBar)
}

/** Gestionnaire des événement clavier et souris
 *  A chargé au chargement de la page
 */
function inputEventManager() {

    $("#fileSelector").one("change", event => associateBVH(event, scene, bvhAnimationsArray))

    $("#play").on("click", clickOnPlayAction)

    $("#replay").on("click", clickOnReplayAction)

    $("#time-slider").on("change", advanceTimeBar)

    $(document).on("keydown", event => keydownAction(event))

    $(document).on("keyup", event => keyupAction(event))
}

/**
 * TODO 
 */
function clickOnPlayAction() {
    playAnimation = !playAnimation
    if (playAnimation === false) {
        cancelAnimationFrame(animate)
        framerateTimeReference = -1
    } else
        requestAnimationFrame(animate)
}

/**
 * TODO
 */
function clickOnReplayAction() {
    bvhAnimationsArray.forEach(bvh => {
        bvh[1].setTime(0)
    });
}

/**
 * problème: comment gérer la barre quand il y'a plusieurs animations ?
 */
function advanceTimeBar() {
    // TODO
}

function keydownAction(keyEvent) {
    let keyPressed = keyEvent.originalEvent.key.toUpperCase()
    switch (keyPressed) {
        case "Z":
        case "Q":
        case "S":
        case "D":
            // Déjà utiliser par le déplacement de la caméra
            break
        case "SHIFT":
            mouseControls.screenSpacePanning = true
            mouseControls.keys.UP = 83 // S
            mouseControls.keys.BOTTOM = 90 // Z
            break
    }
}

function keyupAction(keyEvent) {
    let keyPressed = keyEvent.originalEvent.key.toUpperCase()
    switch (keyPressed) {
        case "Z":
        case "Q":
        case "S":
        case "D":
            // Déjà utiliser par le déplacement de la caméra
            break
        case "SHIFT":
            mouseControls.screenSpacePanning = false
            mouseControls.keys.UP = 90 // Z
            mouseControls.keys.BOTTOM = 83 // S
            break
    }
}