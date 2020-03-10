let scene, renderer, camera, mouseControls
let framerateTimeReference = -1
let currentScreenFrameTime = 0.01667
let playAnimation = true

let bvhWithMaximumNbFrames = { nbFrames: 0 }

/** [{name, skeleton, clip(mixer), frameTime, nbFrames},] */
let bvhAnimationsArray = []
const initialCameraPosition = 150
let pauseDiv = $('<div><img src="./images/pause_button.svg"></div>')
let playDiv = $('<div><img src="./images/play_button.svg"></div>')
let bvhLoader

let generalTimeSlider

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

function updateRendererSize() {
    renderer.setSize($("#player")[0].offsetWidth, $("#player")[0].offsetHeight)
    camera.aspect = $("#player")[0].offsetWidth / $("#player")[0].offsetHeight
}

/**
 * Initialise le lecteur avec une grille de référence
 * Joue les animations quand elles existent
 * Initialise les interactions à la souris et au clavier
 */
$(function initialisePlayer() {
    generalTimeSlider = $("#time-slider")[0]

    scene = new THREE.Scene()

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize($("#player")[0].offsetWidth, $("#player")[0].offsetHeight)
    $("#player").append(renderer.domElement)
    window.onresize = updateRendererSize

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
        RIGHT: THREE.MOUSE.PAN
    }
    mouseControls.keys = {
        LEFT: 81, // q
        UP: 90, // z
        RIGHT: 68, // d
        BOTTOM: 83 // s
    }

    bvhLoader = new BVHLoader(scene, bvhAnimationsArray)

    inputEventManager()

    animate()
})

/** TODO */
function animate() {
    if (bvhLoader.loadingState !== "loading") {
        requestAnimationFrame(animate)
        mouseControls.update()
        if (playAnimation === true) {
            if (bvhLoader.loadingState === "loaded") {
                bvhAnimationsArray.forEach(bvh => {
                    if (bvh.nbFrames > generalTimeSlider.valueAsNumber) {
                        bvh.clip.timeScale = currentScreenFrameTime / bvh.frameTime
                        bvh.clip.update(bvh.frameTime)
                    }
                });
                if (generalTimeSlider.max > generalTimeSlider.valueAsNumber) { generalTimeSlider.valueAsNumber += bvhWithMaximumNbFrames.clip.timeScale }
                updateFrameTime()
            }
        }
    } else {
        framerateTimeReference = -1
        $("#messagePlayer").show()
    }
    renderer.render(scene, camera)
}



/** TODO */
function fileLoadedCallBack() {
    $("#messagePlayer").hide()

    // Update par rapport au timer général actuel
    let timeSliderCurrentValue = $("#time-slider")[0].valueAsNumber
    bvhAnimationsArray.forEach(bvh => {
        if (bvh.nbFrames > bvhWithMaximumNbFrames.nbFrames) { bvhWithMaximumNbFrames = bvh }
        let newTime = bvh.nbFrames > timeSliderCurrentValue ? bvh.frameTime * timeSliderCurrentValue : bvh.frameTime * bvh.nbFrames
        bvh.clip.setTime(newTime)
    });

    $("#fileSelector").one("change", event => bvhLoader.loadBVH(event, fileLoadedCallBack))
    $("#play").on("click", clickOnPlayAction)
    $("#replay").on("click", clickOnReplayAction)

    $("#time-slider")[0].min = 0
    $("#time-slider")[0].max = bvhAnimationsArray.map(bvh => { return bvh.nbFrames }).max()

    $("#time-slider").on("change", advanceTimeBar)
    generalTimeSlider = $("#time-slider")[0]
    requestAnimationFrame(animate)
}

/** Gestionnaire des événement clavier et souris
 *  A chargé au chargement de la page
 */
function inputEventManager() {

    $("#fileSelector").one("change", event => bvhLoader.loadBVH(event, fileLoadedCallBack))

    $("#play").on("click", clickOnPlayAction)

    $("#replay").on("click", clickOnReplayAction)

    $("#time-slider").on("change", advanceTimeBar)

    $(document).on("keydown", event => keydownAction(event))

    $(document).on("keyup", event => keyupAction(event))

    $("#closeOpenButton").one("click", closeObjectListAction)
}

/**
 * TODO 
 */
function clickOnPlayAction() {
    playAnimation = !playAnimation
    if (playAnimation == false) {
        $("#play").children().replaceWith(playDiv)
    } else {
        $("#play").children().replaceWith(pauseDiv)
    }
}

/**
 * TODO
 */
function clickOnReplayAction() {
    let currPlayingAnim = playAnimation
    playAnimation = false
    $("#time-slider")[0].valueAsNumber = $("#time-slider")[0].min
    bvhAnimationsArray.forEach(bvh => {
        bvh.clip.setTime(1)
    });
    if (currPlayingAnim == true) {
        playAnimation = true
    }
}

/**
 * Fonction appellée pour minimiser la div de sélection d'élements
 */
function closeObjectListAction() {

    $("#objectSelector").animate({
        width: '2%',
        marginRight: '0.5%'
    }, {
        duration: 100
    })

    $("#player").animate({
        width: '87.5%'
    }, {
        duration: 100,
        progress: updateRendererSize,
        complete: _ => $("#closeOpenButton").one("click", openObjectListAction)
    })

    $("#objectSelector").children().not("#closeOpenButton").fadeOut(100)

    $("#messagePlayer").animate({
        width: '84%'
    }, {
        duration: 100,
    })
}

/**
 * Fonction appellée pour "ouvrir" la div de sélection d'élements
 */
function openObjectListAction() {

    $("#objectSelector").animate({
        width: '30%'
    }, {
        duration: 100
    })

    $("#player").animate({
        width: '59%'
    }, {
        duration: 100,
        progress: updateRendererSize,
        complete: _ => $("#closeOpenButton").one("click", closeObjectListAction)
    })

    $("#objectSelector").children().not("#closeOpenButton").fadeIn(100)

    $("#messagePlayer").animate({
        width: '59%'
    }, {
        duration: 100,
    })
}

/**
 * TODO
 */
function advanceTimeBar() {
    let currPlayingAnim = playAnimation
    playAnimation = false
    console.log($("#time-slider")[0].valueAsNumber)
    framerateTimeReference = -1
    $("#time-slider")[0].max
    bvhAnimationsArray.forEach(bvh => {
        let newTime = bvh.nbFrames > $("#time-slider")[0].valueAsNumber ? bvh.frameTime * $("#time-slider")[0].valueAsNumber : bvh.frameTime * bvh.nbFrames
        bvh.clip.setTime(newTime)
    });
    if (currPlayingAnim == true) {
        playAnimation = true
    } else {
        renderer.render(scene, camera)
    }
}

/** TODO */
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
            mouseControls.keys.UP = 90 // Z
            mouseControls.keys.BOTTOM = 83 // S
            break
    }
}

/** TODO */
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