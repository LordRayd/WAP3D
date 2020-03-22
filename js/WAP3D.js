class Player {

  /**
   * Joue les animations quand elles existent
   * Initialise les interactions à la souris et au clavier
   */
  constructor(scene, renderer, camera, cameraControls, bvhAnimationsArray) {
    this.scene = scene
    this.renderer = renderer
    this.camera = camera
    this.cameraControls = cameraControls
    this.bvhAnimationsArray = bvhAnimationsArray
    this.generalTimeSlider = $("#time-slider")[0]
    this.framerateTimeReference = -1
    this.currentScreenFrameTime = 0.01667
    this.bvhWithMaximumNbFrames = { nbFrames: 0 }

    this._initialisePlayer()

    /** TODO */
    this.bvhLoader = new BVHLoader(this.scene, this.bvhAnimationsArray)

    /** TODO */
    this.animating = true
    this.playAnimation = true

    this._animate()
  }

  /**
   * Initialise le lecteur avec une grille de référence
   */
  _initialisePlayer() {
    this.generalTimeSlider.min = 1
    this.generalTimeSlider.valueAsNumber = this.generalTimeSlider.min

    this.renderer.setSize($("#player")[0].offsetWidth, $("#player")[0].offsetHeight)
    $("#player").append(this.renderer.domElement)

    let initialCameraPosition = 150
    this.camera.position.z = initialCameraPosition
    this.camera.position.y = initialCameraPosition

    this.scene.add(new THREE.GridHelper(1000, 50))

    this.cameraControls.enableKeys = true
    this.cameraControls.rotateSpeed = 0.3
    this.cameraControls.keyPanSpeed = 25
    this.cameraControls.screenSpacePanning = false // Défini si le translate se fait par rapport à (X,Z) ou par rapport à la caméra
    this.cameraControls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE, //rotate
      MIDDLE: THREE.MOUSE.DOLLY, //zoom
      RIGHT: THREE.MOUSE.PAN
    }
    this.cameraControls.keys = {
      LEFT: 81, // q
      UP: 90, // z
      RIGHT: 68, // d
      BOTTOM: 83 // s
    }
  }

  /** TODO */
  updateRendererSize() {
    let player = $("#player")[0]
    this.renderer.setSize(player.offsetWidth, player.offsetHeight)
    this.camera.aspect = player.offsetWidth / player.offsetHeight
  }

  /** TODO */
  toggleAnimation() {
    this.playAnimation = !this.playAnimation
    if (this.playAnimation == false) {
      this.framerateTimeReference = -1
    }
    return this.playAnimation
  }

  /** TODO */
  stopAnimation() {
    this.playAnimation = false
    return this.playAnimation
  }

  /** TODO */
  startAnimation() {
    this.playAnimation = true
    return this.playAnimation
  }

  /** TODO */
  fileLoadedCallBack() {
    $("#messagePlayer").hide()

    this.bvhWithMaximumNbFrames = this.bvhAnimationsArray.getByMaxNbOfFrames()
    this.generalTimeSlider.max = this.bvhWithMaximumNbFrames.nbFrames

    // Update par rapport au timer général actuel
    this.bvhAnimationsArray.setAllBvhFrameTime(this.generalTimeSlider.valueAsNumber)

    updateEventListener()

    requestAnimationFrame(this._animate.bind(this))
  }

  /** TODO */
  _animate() {
    if (this.bvhLoader.loadingState !== "loading") {
      requestAnimationFrame(this._animate.bind(this))
      this.bvhAnimationsArray.updateAllElementsProperties()
      this.cameraControls.update()
      if (this.playAnimation === true) {
        this.animating = true
        
        //BVH---
        if (this.bvhLoader.loadingState === "loaded") {
          this.bvhAnimationsArray.updateAllElementsAnimation(this.generalTimeSlider.valueAsNumber, this.currentScreenFrameTime)

          // Regle le probleme de clic sur le slider (cependant si frameTime misAjour, saut dans le temps Etrange)
          // this.bvhAnimationsArray.setAllBvhFrameTime(this.generalTimeSlider.valueAsNumber)
          // this.bvhWithMaximumNbFrames.clip.timeScale = this.currentScreenFrameTime / this.bvhWithMaximumNbFrames.frameTime

          this._updateFrameTime()
          if (this.generalTimeSlider.max > this.generalTimeSlider.valueAsNumber) {
            this.generalTimeSlider.valueAsNumber += this.bvhWithMaximumNbFrames.clip.timeScale;
            //console.log(this.generalTimeSlider.valueAsNumber)
          }
          if (console.DEBUG_MODE == true) $("#messagePlayer").text(this.generalTimeSlider.valueAsNumber).show()
        }
        
        // FBX---
          // TODO

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
  get framerateTimeReference() {
    return this._framerateTimeReference == -1 ? Date.now() : this._framerateTimeReference
  }
  /** TODO */
  set framerateTimeReference(newFrameTimeRef) {
    this._framerateTimeReference = newFrameTimeRef
  }
}