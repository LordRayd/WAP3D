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
    this.framerateTimeReference = -1
    this.currentScreenFrameTime = 0.01667

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

  /** Animation des element dans le player */
  _animate() {
    if (this.bvhLoader.loadingState !== "loading") {
      requestAnimationFrame(this._animate.bind(this))
      this.bvhAnimationsArray.updateAllElementsProperties()
      this.cameraControls.update()
      this.animating = true

      //BVH---
      if (this.bvhLoader.loadingState === "loaded") {
        if (this.animationIsPaused == false) {
          if (this.bvhAnimationsArray.updateAllElementsAnimation(this.currentScreenFrameTime) == true) {
            // Regle le probleme de clic sur le slider (cependant si frameTime misAjour, saut dans le temps Etrange)

            this._updateFrameTime()

          } else {
            this._pauseAnimation()
          }
        } else {
          if (this.bvhAnimationsArray.updateAllElementsAnimation(this.currentScreenFrameTime) == true) {
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

  /** Lance le chargement de fichier a partir d'un evenement de selectioner de fichier entre en parametre
   * 
   * @param event evenement de selection de fichier
   */
  loadFile(event, objectType) {
    return new Promise(async(resolve, reject) => {
      if (objectType.toLowerCase() == "bvh") {
        try {
          await this.bvhLoader.loadBVH(event)
        } catch (error) {
          alert(error)
        } finally {
          this.fileLoadedCallBack()
        }
        resolve()
      } else if (objectType.toLowerCase() == "fbx") {
        alert(objectType, "not implemented")
      } else {
        alert(objectType, "not implemented")
      }
    })
  }

  /** Callback appeler a la fin du chargement de fichier
   *  Il permet de mettre à jour les listener manquant sur le player
   *  L'animation est relancé à la fin de l'appel
   */
  fileLoadedCallBack() {
    $("#messagePlayer").hide()

    // Update par rapport au timer général actuel
    this.bvhAnimationsArray.setAllBvhTime(0)

    updateEventListener()

    requestAnimationFrame(this._animate.bind(this))
  }

  /** Met a jour la taille du lecteur en fonction de la taille courrante de la page web */
  updateRendererSize() {
    let player = $("#player")[0]
    this.renderer.setSize(player.offsetWidth, player.offsetHeight)
    this.camera.aspect = player.offsetWidth / player.offsetHeight
  }

  /** Lance l'animation si elle est nen pause. Met l'animation en pause sinon pour l'ensemble des element du player */
  toggleAnimation() {
    if (this.animationIsPaused) this.resumeAnimation()
    else this._pauseAnimation()
  }

  /** Met l'animation en pause pour l'ensemble des element du player */
  _pauseAnimation() {
    this.animationIsPaused = true
    this.bvhAnimationsArray.pauseAllAnimation()
    this._updateGeneralPlayPauseImg()
  }

  /** Relance l'animation depuis le debut pour l'ensemble des element du player */
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

  /** Relance l'animation a l'endroit ou elle s'est arrêté pour l'ensemble des element du player */
  resumeAnimation() {
    this.animationIsPaused = false
    if (this.bvhAnimationsArray.resumeAllAnimation() == false) {
      this._playAnimation()
    } else {
      this._updateGeneralPlayPauseImg()
    }
  }

  /** Lance l'animation pour l'ensemble des element du player */
  _playAnimation() {
    this.animationIsPaused = false
    this.bvhAnimationsArray.playAllAnimation()
    this._updateGeneralPlayPauseImg()
  }

  /** Passe de l'image de pause a celle de lecture si le player est en pause. Passe de lecture a pause si le player est en lecture */
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

  /** Lance l'animation si elle est nen pause. Met l'animation en pause sinon pour un element selectionner du player
   * 
   * @param objectUuid_ Identifiant de l'object selectionner dans la scene
   */
  toggleObjectInListAnimation(objectUuid_) {
    if (this.bvhAnimationsArray.contain(objectUuid_)) {
      this.bvhAnimationsArray.toggleOneBVHAnimation(objectUuid_)
    } else {
      //FBX
    }
  }

  /** Relance l'animation depuis le debut pour un element selectionner du player
   * 
   * @param objectUuid_ Identifiant de l'object selectionner dans la scene
   */
  replayObjectInListAnimation(objectUuid_) {
    if (this.bvhAnimationsArray.contain(objectUuid_)) {
      this.bvhAnimationsArray.replayOneBVHAnimation(objectUuid_)
    } else {
      //FBX
    }
  }

  /** Met a jour le time slider d'un element du player slectionner avec la nouvelle valeur entré en paramètre
   * 
   * @param objectUuid_ Identifiant de l'object selectionner dans la scene
   * @param newValue Nouvelle valeur du time slider
   */
  modifyObjectInListTimeSlider(objectUuid_, newValue) {
    if (this.bvhAnimationsArray.contain(objectUuid_)) {
      this.bvhAnimationsArray.modifyOneBVHFTimeSlider(objectUuid_, newValue)
    } else {
      //FBX
    }
  }

  /** Ajoute une fenetre de controle avancé pour un ou plusieurs objects selectionner du player
   * 
   * @param objectUuid_ Identifiant de l'object selectionner dans la scene
   */
  launchAdvancedControls(objectUuid_) {
    if (this.bvhAnimationsArray.contain(objectUuid_)) {
      //TODO prendre en compte si plusieurs éléments sont selectionné pour les contrôles avancés
      //TODO ajouter comportement si page déjà ouverte
      $("body").append('<div id="advencedControlForBVH" title="' + this.bvhAnimationsArray.getByUUID(objectUuid_).name + "\t" + objectUuid_ + '"></div>')

      //TODO parcourir dynamiquement arbre de squelette pour pouvoir en faire des listes de liste intégrable dans la fenêtre

      //TODO voir comment rajouter l'UUID plus bas dans la hiérarchie de l'élément
      //pour effacer l'horreur de IEM.updateElementAnimationSpeed
      $("#advencedControlForBVH").append('\
        <div id="advancedControlsTabsForBVH" data-uuid="' + objectUuid_ + '">\
          <ul> \
            <li><a href="#graphs">Graphs</a></li>\
            <li><a href="#rendering">Rendering Options</a></li>\
            <li><a href="#selection">Display Selection</a></li>\
          </ul>\
          <div id="graphs">\
          </div>\
          <div id="rendering">\
            <ul>\
              <li><input id="speedRatioSelector" type="number" step="0.25"></li>\
              <li>\
                <label for="orthoEnabled"> Affichage d\'un repère orthonormé pour chaque articulation</label>\
                <input type="checkbox" name="orthoEnabled" id="orthoEnabled">\
              </li>\
              <li>\
                <p> Rendering mode: </p>\
                <label for="WireFrame">WireFrame</label>\
                <input type="radio" id="renderModeWireFrame" name="renderMode" value="WireFrame"><br>\
                <label for="Cubic">Cubic</label>\
                <input type="radio" id="renderModeCubic" name="renderMode" value="Cubic"><br>\
              </li>\
            </ul>\
          </div>\
          <div id="selection">\
          </div>\
        </div>\
      ')

      //ne marche pas car le passage entre deux frames ne prend pas les AnimationMixer en compte
      $("#speedRatioSelector").change((object) => {
        let uuid = object.target.parentNode.parentNode.parentNode.parentNode.getAttribute('data-uuid')
        let newTimeScaleValue = object.target.valueAsNumber
        this.bvhAnimationsArray.getByUUID(uuid).speedRatio = newTimeScaleValue
      })

      $("#advancedControlsTabsForBVH").tabs()

      $("#advencedControlForBVH").dialog({
        height: 480,
        width: 640,
        close: (event, ui) => {
          $("#advencedControlForBVH").remove()
        }
      })
    } else {
      //FBX
    }
  }

  /** Retourne le frame time de reference actuel s'il existe. Retourne la date courrante en miliseconde sinon. */
  get framerateTimeReference() {
    return this._framerateTimeReference == -1 ? Date.now() : this._framerateTimeReference
  }

  /**  */
  set framerateTimeReference(newFrameTimeRef) {
    this._framerateTimeReference = newFrameTimeRef
  }
}