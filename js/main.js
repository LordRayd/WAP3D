/** TODO */
$(_ => {
  let scene = new THREE.Scene()
  let renderer = new THREE.WebGLRenderer({ antialias: true })
  let camera = new THREE.PerspectiveCamera(90, $("#player")[0].offsetWidth / $("#player")[0].offsetHeight, 0.1, 1000)
  let cameraControls = new THREE.OrbitControls(camera, renderer.domElement)
  let bvhAnimationsArray = new BVHAnimationArray()

  player = new Player(scene, renderer, camera, cameraControls, bvhAnimationsArray)
  inputEventManager = new IEM(player, cameraControls)

  setAllEventListener()
})

let player
let inputEventManager

/** TODO */
function setAllEventListener() {
  $(document).on("keydown", event => inputEventManager.keydownAction(event))
  $(document).on("keyup", event => inputEventManager.keyupAction(event))

  $(window).on("resize", event => inputEventManager.modifyWindowSizeAction(event))

  $("#closeOpenButton").one("click", event => inputEventManager.closeObjectListAction(event))

  $("#playPause").on("click", event => inputEventManager.clickOnPlayAction(event))
  $("#replay").on("click", event => inputEventManager.clickOnReplayAction(event))
  $("#time-slider").on("change", event => inputEventManager.modifyTimeSliderAction(event))

  $("#fileSelector").one("change", event => {
    // TODO bloquer IEM
    player.bvhLoader.loadBVH(event, player.fileLoadedCallBack.bind(player))
  })
}

function updateEventListener() {
  $("#playPause").on("click", event => inputEventManager.clickOnPlayAction(event))
  $("#replay").on("click", event => inputEventManager.clickOnReplayAction(event))
  $("#time-slider").on("change", event => inputEventManager.modifyTimeSliderAction(event))

  $("#fileSelector").one("change", event => {
    // TODO bloquer IEM
    player.bvhLoader.loadBVH(event, player.fileLoadedCallBack.bind(player))
  })
}