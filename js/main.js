const pauseDiv = $('<div><img src="./images/pause_button.svg"></div>')
const playDiv = $('<div><img src="./images/play_button.svg"></div>')

let player
let inputEventManager

/** Code exécuté après le chargement complet de WAP3D.html */
$(_ => {
  $("#listTabs").tabs()

  let scene = new THREE.Scene()
  let renderer = new THREE.WebGLRenderer({ antialias: true })
  let camera = new THREE.PerspectiveCamera(90, $("#player")[0].offsetWidth / $("#player")[0].offsetHeight, 0.1, 2000)
  let cameraControls = new THREE.OrbitControls(camera, renderer.domElement)
  let bvhAnimationsArray = new BVHAnimationArray()
  let fbxAnimationsArray = new FBXAnimationArray()

  player = new Player(scene, renderer, camera, cameraControls, bvhAnimationsArray, fbxAnimationsArray)
  inputEventManager = new IEM(player, cameraControls)

  _setAllEventListener()
})

/** Associe toutes les méthodes liés aux modes d'interactions avec les objets de la page */
function _setAllEventListener() {
  $(document).on("keydown", event => inputEventManager.keydownAction(event))
  $(document).on("keyup", event => inputEventManager.keyupAction(event))

  $(window).on("resize", event => inputEventManager.modifyWindowSizeAction(event))

  $("#closeOpenButton").one("click", event => inputEventManager.closeObjectListAction(event))

  $("#globalPlayPause").on("click", event => inputEventManager.clickOnGlobalPlayPauseAction(event))
  $("#globalReplay").on("click", event => inputEventManager.clickOnGlobalReplayAction(event))

  $("#BVHListPlay").on("click", event => inputEventManager.clickOnListPlayAction(event))
  $("#BVHListPause").on("click", event => inputEventManager.clickOnListPauseAction(event))
  $("#BVHListReplay").on("click", event => inputEventManager.clickOnListReplayAction(event))
  $("#BVHListdisplay").on("click", event => inputEventManager.toggleListVisibilityCheckboxAction(event))


  $("#FBXListPlay").on("click", event => inputEventManager.clickOnListPlayAction(event));
  $("#FBXListPause").on("click", event => inputEventManager.clickOnListPauseAction(event));
  $("#FBXListReplay").on("click", event => inputEventManager.clickOnListReplayAction(event));
  $("#FBXListdisplay").on("click", event => inputEventManager.toggleListVisibilityCheckboxAction(event));

  $(".fileSelector").one("change", event => inputEventManager.fileSelectedAction(event))
}

/** Associe ou réassocie les méthodes liés aux modes d'interactions avec les objets de la page */
function updateEventListener() {
  $("#globalPlayPause").on("click", event => inputEventManager.clickOnGlobalPlayPauseAction(event))
  $("#globalReplay").on("click", event => inputEventManager.clickOnGlobalReplayAction(event))

  $(".fileSelector").off("change")
  $(".fileSelector").one("change", event => inputEventManager.fileSelectedAction(event))

  $(".playPause").off("click")
  $(".replay").off("click")
  $(".timeSlider").off("input")
  $(".playPause").on("click", event => inputEventManager.clickOnElementPlayPauseAction(event))
  $(".replay").on("click", event => inputEventManager.clickOnElementReplayAction(event))
  $(".timeSlider").on("input", event => inputEventManager.modifyElementTimeSliderAction(event))
  $(".display").on("click", event => inputEventManager.toggleElementVisibilityCheckboxAction(event))

  // Sélection unique d'éléments de liste
  $(".objectList .list .object").off("dblclick")
  $(".objectList .list .object").on("dblclick", event => inputEventManager.openAdvancedControlsAction(event))

  //Sélection multiple
  $(".objectList .list .object").off("click")
  $(".objectList .list .object").on("click", event => inputEventManager.selectElementFromListAction(event))
}