class wap3D {

  /**
   * Joue les animations quand elles existent
   * Initialise les interactions à la souris et au clavier
   */
  constructor() {
    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.camera = new THREE.PerspectiveCamera(90, $("#player")[0].offsetWidth / $("#player")[0].offsetHeight, 0.1, 1000)
    this.mouseControls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
    this.bvhAnimationsArray = new BVHAnimationArray()
    this.generalTimeSlider = $("#time-slider")[0]

    this.framerateTimeReference = -1
    this.currentScreenFrameTime = 0.01667
    this._initialiseSceneRenderer()

    this.bvhWithMaximumNbFrames = { nbFrames: 0 }
    this.bvhLoader = new BVHLoader(this.scene, this.bvhAnimationsArray)

    this._activateEventListener()

    this.animating = true
    this.playAnimation = true
    this._animate()
  }

  /**
   * Initialise le lecteur avec une grille de référence
   */
  _initialiseSceneRenderer() {
    this.generalTimeSlider.min = 1
    this.generalTimeSlider.valueAsNumber = this.generalTimeSlider.min

    this.renderer.setSize($("#player")[0].offsetWidth, $("#player")[0].offsetHeight)
    $("#player").append(this.renderer.domElement)

    let initialCameraPosition = 150
    this.camera.position.z = initialCameraPosition
    this.camera.position.y = initialCameraPosition

    this.scene.add(new THREE.GridHelper(1000, 50))

    this.mouseControls.enableKeys = true
    this.mouseControls.rotateSpeed = 0.3
    this.mouseControls.keyPanSpeed = 25
    this.mouseControls.screenSpacePanning = false // Défini si le translate se fait par rapport à (X,Z) ou par rapport à la caméra
    this.mouseControls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE, //rotate
      MIDDLE: THREE.MOUSE.DOLLY, //zoom
      RIGHT: THREE.MOUSE.PAN
    }
    this.mouseControls.keys = {
      LEFT: 81, // q
      UP: 90, // z
      RIGHT: 68, // d
      BOTTOM: 83 // s
    }
  }

  /** TODO */
  _fileLoadedCallBack() {
    $("#messagePlayer").hide()

    // Update par rapport au timer général actuel
    let timeSliderCurrentValue = this.generalTimeSlider.valueAsNumber
    this.bvhWithMaximumNbFrames = this.bvhAnimationsArray.getByMaxNbOfFrames()
    this.bvhAnimationsArray.forEach(bvh => {
      let newTime = bvh.nbFrames > timeSliderCurrentValue ? bvh.frameTime * timeSliderCurrentValue : bvh.frameTime * bvh.nbFrames
      bvh.clip.setTime(newTime)
    });

    this.generalTimeSlider.max = this.bvhWithMaximumNbFrames.nbFrames

    this._activateEventListener()

    requestAnimationFrame(this._animate.bind(this))
  }

  /** TODO */
  _animate() {
    if (this.bvhLoader.loadingState !== "loading") {
      requestAnimationFrame(this._animate.bind(this))
      this.mouseControls.update()
      if (this.playAnimation === true) {
        this.animating = true
        if (this.bvhLoader.loadingState === "loaded") {
          this.bvhAnimationsArray.forEach(bvh => {
            if (bvh.nbFrames > this.generalTimeSlider.valueAsNumber) {
              bvh.clip.timeScale = this.currentScreenFrameTime / bvh.frameTime
              bvh.clip.update(bvh.frameTime)
            }
          });
          if (this.generalTimeSlider.max > this.generalTimeSlider.valueAsNumber) { this.generalTimeSlider.valueAsNumber += this.bvhWithMaximumNbFrames.clip.timeScale }
          this._updateFrameTime()
          if (console.DEBUG_MODE == true) $("#messagePlayer").text(this.generalTimeSlider.valueAsNumber).show()
        }
        this.animating = false
      }
    } else {
      this.framerateTimeReference = -1
      $("#messagePlayer").text("Chargement en cours").show()
    }
    this.renderer.render(this.scene, this.camera)
  }

  /**
   * Permet de récupérer le frame time du navigateur en secondes
   * Estimation approximative à l'instant T
   */
  _updateFrameTime() {
    let currDateTime = Date.now()
    let delta = (currDateTime - this.framerateTimeReference) / 1000;
    this.framerateTimeReference = currDateTime
    this.currentScreenFrameTime = delta;
  }

  /** TODO */
  _activateEventListener() {
    $("#fileSelector").one("change", event => {
      // TODO bloquer IEM
      this.bvhLoader.loadBVH(event, this._fileLoadedCallBack.bind(this))
    })
    updateEventListener()
  }

  /** TODO */
  get framerateTimeReference() {
    return this._framerateTimeReference == -1 ? Date.now() : this._framerateTimeReference
  }

  /** TODO */
  set framerateTimeReference(newFrameTimeRef) {
    this._framerateTimeReference = newFrameTimeRef
  }

  /** TODO */
  get mouseControls() {
    return this._mouseControls
  }

  /** TODO */
  set mouseControls(newValue) {
    this._mouseControls = newValue
  }

  /** TODO */
  updateRendererSize() {
    let player = $("#player")[0]
    this.renderer.setSize(player.offsetWidth, player.offsetHeight)
    this.camera.aspect = player.offsetWidth / player.offsetHeight
  }

  /** TODO */
  toggleAnimation(){
    this.playAnimation = !this.playAnimation
    return this.playAnimation
  }
  /** TODO */
  stopAnimation(){
    this.playAnimation = false
    return this.playAnimation
  }
  /** TODO */
  startAnimation(){
    this.playAnimation = true
    return this.playAnimation
  }

  /** TODO */
  setAllBvhFrameTime(time){
    this.bvhAnimationsArray.forEach(bvh => {
      let newTime = bvh.nbFrames > time ? bvh.frameTime * time : bvh.frameTime * bvh.nbFrames
      bvh.clip.setTime(newTime)
    });
  }
}