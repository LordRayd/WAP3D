const pauseDiv = $('<div><img src="./images/pause_button.svg"></div>')
const playDiv = $('<div><img src="./images/play_button.svg"></div>')

/** TODO */
$(_ => {
  let scene = new THREE.Scene()
  let renderer = new THREE.WebGLRenderer({ antialias: true })
  let camera = new THREE.PerspectiveCamera(90, $("#player")[0].offsetWidth / $("#player")[0].offsetHeight, 0.1, 1000)
  let cameraControls = new THREE.OrbitControls(camera, renderer.domElement)
  let bvhAnimationsArray = new BVHAnimationArray()

  player = new Player(scene, renderer, camera, cameraControls, bvhAnimationsArray)
  inputEventManager = new IEM(player, cameraControls)

  _setAllEventListener()
})

let player
let inputEventManager

/** TODO */
function _setAllEventListener() {
  $(document).on("keydown", event => inputEventManager.keydownAction(event))
  $(document).on("keyup", event => inputEventManager.keyupAction(event))

  $(window).on("resize", event => inputEventManager.modifyWindowSizeAction(event))

  $("#closeOpenButton").one("click", event => inputEventManager.closeObjectListAction(event))

  $("#globalPlayPause").on("click", event => inputEventManager.clickOnGlobalPlayPauseAction(event))
  $("#globalReplay").on("click", event => inputEventManager.clickOnGlobalReplayAction(event))
  $("#globalTimeSlider").on("change", event => inputEventManager.modifyGlobalTimeSliderAction(event))

  $("#fileSelector").one("change", event => {
    // TODO bloquer IEM
    player.bvhLoader.loadBVH(event, player.fileLoadedCallBack.bind(player))
  })
}

/** TODO */
function updateEventListener() {
  $("#globalPlayPause").on("click", event => inputEventManager.clickOnGlobalPlayPauseAction(event))
  $("#globalReplay").on("click", event => inputEventManager.clickOnGlobalReplayAction(event))
  $("#globalTimeSlider").on("change", event => inputEventManager.modifyGlobalTimeSliderAction(event))

  $("#fileSelector").one("change", event => {
    // TODO bloquer IEM
    player.bvhLoader.loadBVH(event, player.fileLoadedCallBack.bind(player))
  })

  $(".playPause").on("click", event => inputEventManager.clickOnPlayPauseAction(event))
  $(".replay").on("click", event => inputEventManager.clickOnReplayAction(event))
  $(".timeSlider").on("change", event => inputEventManager.modifyTimeSliderAction(event))
}