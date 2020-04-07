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
    this.globalTimeSlider = $("#globalTimeSlider")[0]
    this.framerateTimeReference = -1
    this.currentScreenFrameTime = 0.01667
    this.bvhWithMaximumNbFrames = { nbFrames: 0 }

    this._initialisePlayer()

    /** TODO */
    this.bvhLoader = new BVHLoader(this.scene, this.bvhAnimationsArray)

    /** TODO */
    this.animating = true
    this.animationIsPaused = true

    this._animate()
  }

  /**
   * Initialise le lecteur avec une grille de référence
   */
  _initialisePlayer() {
    this.globalTimeSlider.min = 1
    this.globalTimeSlider.valueAsNumber = this.globalTimeSlider.min

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
  _animate() {
    if (this.bvhLoader.loadingState !== "loading") {
      requestAnimationFrame(this._animate.bind(this))
      this.bvhAnimationsArray.updateAllElementsProperties()
      this.cameraControls.update()
      this.animating = true

      //BVH---
      if (this.bvhLoader.loadingState === "loaded") {
        if (this.animationIsPaused == false) {
          if (this.bvhAnimationsArray.updateAllElementsAnimation(this.globalTimeSlider.valueAsNumber, this.currentScreenFrameTime) == true) {
            // Regle le probleme de clic sur le slider (cependant si frameTime misAjour, saut dans le temps Etrange)
            // this.bvhAnimationsArray.setAllBvhFrameTime(this.globalTimeSlider.valueAsNumber)
            // this.bvhWithMaximumNbFrames.clip.timeScale = this.currentScreenFrameTime / this.bvhWithMaximumNbFrames.frameTime
            this._updateFrameTime()
            if (this.globalTimeSlider.max > this.globalTimeSlider.valueAsNumber) {
              this.globalTimeSlider.valueAsNumber += this.bvhWithMaximumNbFrames.clip.timeScale;
              //console.log(this.globalTimeSlider.valueAsNumber)
            }
            if (console.DEBUG_MODE == true) $("#messagePlayer").text(this.globalTimeSlider.valueAsNumber).show()
          } else {
            this._pauseAnimation()
          }
        } else {
          if (this.bvhAnimationsArray.updateAllElementsAnimation(this.globalTimeSlider.valueAsNumber, this.currentScreenFrameTime) == true) {
            this.animationIsPaused = false
            this._updateGeneralPlayPauseImg()
          }
        }
      }

      // FBX---
      // TODO

      this.animating = false
    } else {
      this.framerateTimeReference = -1
      $("#messagePlayer").text("Chargement en cours").show()
    }
    this.renderer.render(this.scene, this.camera)
  }

  /** TODO */
  fileLoadedCallBack() {
    $("#messagePlayer").hide()

    this.bvhWithMaximumNbFrames = this.bvhAnimationsArray.getByMaxNbOfFrames()
    this.globalTimeSlider.max = this.bvhWithMaximumNbFrames.nbFrames

    // Update par rapport au timer général actuel
    this.bvhAnimationsArray.setAllBvhFrameTime(this.globalTimeSlider.valueAsNumber)

    updateEventListener()

    requestAnimationFrame(this._animate.bind(this))
  }

  /** TODO */
  updateRendererSize() {
    let player = $("#player")[0]
    this.renderer.setSize(player.offsetWidth, player.offsetHeight)
    this.camera.aspect = player.offsetWidth / player.offsetHeight
  }

  /** TODO */
  toggleAnimation() {
    if (this.animationIsPaused) this.resumeAnimation()
    else this._pauseAnimation()
  }

  /** TODO */
  _pauseAnimation() {
    this.animationIsPaused = true
    this.bvhAnimationsArray.pauseAllAnimation()
    this._updateGeneralPlayPauseImg()
  }

  /** TODO */
  restartAnimation() {
    let animationWasPlaying = false
    if (this.animationIsPaused == false) {
      animationWasPlaying = true
      this._pauseAnimation()
    }

    this.bvhAnimationsArray.replayAllAnimation(!animationWasPlaying)

    if (animationWasPlaying) {
      this.resumeAnimation()
    }
  }

  /** TODO */
  resumeAnimation() {
    this.animationIsPaused = false
    if (this.bvhAnimationsArray.resumeAllAnimation() == false) {
      this._playAnimation()
    } else {
      this._updateGeneralPlayPauseImg()
    }
  }

  /** TODO */
  _playAnimation() {
    this.animationIsPaused = false
    this.bvhAnimationsArray.playAllAnimation()
    this._updateGeneralPlayPauseImg()
  }

  /** TODO */
  _updateGeneralPlayPauseImg() {
    if (this.animationIsPaused == true) {
      this.framerateTimeReference = -1
      $("#globalPlayPause").children().replaceWith(playDiv)
        // $("#messagePlayer").html(this.playDiv).show(500).hide(500)
    } else {
      $("#globalPlayPause").children().replaceWith(pauseDiv)
        // $("#messagePlayer").html(this.pauseDiv).show(500).hide(500)
    }
  }

  /** TODO */
  toggleObjectInListAnimation(objectUuid_) {
    if (this.bvhAnimationsArray.contain(objectUuid_)) {
      this.bvhAnimationsArray.toggleOneBVHAnimation(objectUuid_)
    } else {
      //FBX
    }
  }

  /** TODO */
  replayObjectInListAnimation(objectUuid_) {
    if (this.bvhAnimationsArray.contain(objectUuid_)) {
      this.bvhAnimationsArray.replayOneBVHAnimation(objectUuid_)
    } else {
      //FBX
    }
  }

  /** TODO */
  modifyObjectInListTimeSlider(objectUuid_, newValue) {
    if (this.bvhAnimationsArray.contain(objectUuid_)) {
      console.log(arguments)
      this.bvhAnimationsArray.modifyOneBVHFTimeSlider(objectUuid_, newValue)
    } else {
      //FBX
    }
  }

  /** TODO */
  launchAdvancedControls(objectUuid_){
    //TODO prendre en compte si plusieurs éléments sont selectionné pour les contrôles avancés
    if (this.bvhAnimationsArray.contain(objectUuid_)) {
      $("body").append('<div id="advencedControlForBVH" title="'+objectUuid_+'"></div>')
      $("#advencedControlForBVH").dialog({
        height: 480,
        width: 640
      })
    } else {
      //FBX
    }
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