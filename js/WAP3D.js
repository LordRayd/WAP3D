class Player {

  /** Joue les animations quand elles existent
   *  Initialise les interactions à la souris et au clavier
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
    this.fbxLoader = new FBXLoader(this.scene);

    /** TODO */
    this.animating = true
    this.animationIsPaused = true

    this._animate()

    //contenu de la fenêtre de contrôles avancés
    this.bvhAdvancedCtrlContent = '\
      <div id="advancedControlsTabsForBVH">\
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
      </div>'
  }

  /** Initialise le lecteur avec une grille de référence */
  _initialisePlayer() {

    this.renderer.setSize($("#player")[0].offsetWidth, $("#player")[0].offsetHeight)
    $("#player").append(this.renderer.domElement)

    let initialCameraPosition = 150
    this.camera.position.z = initialCameraPosition
    this.camera.position.y = initialCameraPosition

    //Éclairage
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.renderSingleSided = false; // permet d'avoir des accumulation d'ombres
    let minimumLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(minimumLight)
    let mainLight = new THREE.SpotLight(0xffffff, 0.5, 0)
    mainLight.position.set(0, 450, 0)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.height = 2048
    mainLight.shadow.mapSize.width = 2048
    this.scene.add(mainLight)
      //this.scene.add(new THREE.SpotLightHelper(light)) //Pour visualiser la main light

    //Plan de présentation
    let plane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 1, 1), new THREE.MeshPhongMaterial({ color: 0xffffff }))
    plane.rotateX(-Math.PI / 2)
    plane.receiveShadow = true
    plane.castShadow = true
    this.scene.add(plane)

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

  /** Permet de récupérer le frame time du navigateur en secondes
   *  Estimation approximative à l'instant T
   */
  _updateFrameTime() {
    let currDateTime = Date.now()
    let delta = (currDateTime - this.framerateTimeReference) / 1000;
    this.framerateTimeReference = currDateTime
    this.currentScreenFrameTime = delta;
  }

  /** Animation des element dans le player */
  _animate() {
    if (this.bvhLoader.loadingState === "loading" || this.fbxLoader.loadingState === "loading") {
      this.framerateTimeReference = -1
      $("#messagePlayer").text("Chargement en cours").show()
      return
    }

    requestAnimationFrame(this._animate.bind(this))
    this.cameraControls.update()
    this.animating = true

    this._updateFrameTime() // Regle le probleme de clic sur le slider (cependant si frameTime misAjour, saut dans le temps Etrange)

    // BVH ---
    this._updateAnimation(this.bvhLoader, this.bvhAnimationsArray)

    // FBX ---
    // TODO Décommenter
    // this._updateAnimation(this.fbxLoader, this.fbxAnimationsArray)
    
    this.animating = false
    this.renderer.render(this.scene, this.camera)
  }

  _updateAnimation(loader, animationArray){
    if (loader.loadingState !== "loading") {
      if (loader.loadingState === "loaded") {
        if (this.animationIsPaused == false) {
          if (animationArray.updateAllElementsAnimation(this.currentScreenFrameTime) == false) { this._pauseAnimation() } // toutes les animations ont fini de jouer
        } else if (animationArray.updateAllElementsAnimation(this.currentScreenFrameTime) == true) {
          // reprise de la lecture => le lecteur est en pause mais un ou plusieur BVH de la liste ont été remis en lecture
          this.animationIsPaused = false
          this._updateGeneralPlayPauseImg()
        }
      }
    }
  }

  /** Lance le chargement de fichier a partir d'un evenement de selectioner de fichier entre en parametre
   * 
   * @param event evenement de selection de fichier
   */
  loadFile(event, objectType) {
    return new Promise(async(resolve, reject) => {
      try {
        if (objectType.toLowerCase() == "bvh") {
          await this.bvhLoader.loadBVH(event)
        } else if (objectType.toLowerCase() == "fbx") {
          await this.fbxLoader.loadFBX(event);
        } else {
          throw new Error(objectType, " : Unknown file type.")
        }
      } catch (error) {
        alert(error)
      } finally {
        console.log("finally CB")
        this._fileLoadedCallBack()
      }
      resolve()
    })
  }

  /** Callback appeler a la fin du chargement de fichier
   *  Il permet de mettre à jour les listener manquant sur le player
   *  L'animation est relancé à la fin de l'appel
   */
  _fileLoadedCallBack() {
    $("#messagePlayer").hide()

    updateEventListener()

    requestAnimationFrame(this._animate.bind(this))
  }

  /** Met a jour la taille du lecteur en fonction de la taille courrante de la page web */
  updateRendererSize() {
    let player = $("#player")[0]
    this.renderer.setSize(player.offsetWidth, player.offsetHeight)
    this.camera.aspect = player.offsetWidth / player.offsetHeight
  }

  /** Lance l'animation si elle est en pause. Met l'animation en pause sinon pour l'ensemble des element du player */
  toggleAnimation() {
    if (this.animationIsPaused) this.resumeAnimation()
    else this._pauseAnimation()
  }

  /** Met l'animation en pause pour l'ensemble des BVH du player */
  pauseBVHAnimation() {
    this.bvhAnimationsArray.pauseAllAnimations()
  }

  /** Relance l'animation a l'endroit ou elle s'est arrêté pour l'ensemble des BVH du player 
   *
   *  @returns {Boolean} True si au moins un élément de l'ensemble reprend effectivement son animation, False sinon.
   */
  playBVHAnimation() {
    return this.bvhAnimationsArray.playAllAnimations()
  }

  /** Relance l'animation depuis le debut pour l'ensemble des element du player
   * 
   *  @param {Boolean} animationWasPLaying_ si True l'animation continue de jouer.
   */
  restartBVHAnimation(animationWasPLaying_) {
    this.bvhAnimationsArray.replayAllAnimations(animationWasPLaying_)
  }

  /** Modifie la visibilité de tout les bvh de la scène 
   * @param {Boolean} newValue Tout les BVH sont visible si true, ils sont tous invisible sinon
   */
  toggleBVHVisibility(newValue) {
    if (newValue === true) {
      this.bvhAnimationsArray.forEach((bvh) => {
        bvh.show()
      })
    } else {
      this.bvhAnimationsArray.forEach((bvh) => {
        bvh.hide()
      })
    }
  }

  /** Met l'animation en pause pour l'ensemble des element du player */
  _pauseAnimation() {
    this.animationIsPaused = true
    this.pauseBVHAnimation()
    this._updateGeneralPlayPauseImg()
  }

  /** Relance l'animation a l'endroit ou elle s'est arrêté pour l'ensemble des element du player */
  resumeAnimation() {
    //TODO gérer FBX
    this.animationIsPaused = false
    if (this.bvhAnimationsArray.resumeAllAnimations() == false) {
      this._playAnimation()
    } else {
      this._updateGeneralPlayPauseImg()
    }
  }

  /** Relance l'animation depuis le debut pour l'ensemble des element du player */
  restartAnimation() {
    let animationWasPlaying = false
    if (this.animationIsPaused == false) {
      animationWasPlaying = true
      this._pauseAnimation()
    }

    this.restartBVHAnimation(!animationWasPlaying)

    if (animationWasPlaying) {
      this.resumeAnimation()
    }
  }

  /** Lance l'animation pour l'ensemble des element du player */
  _playAnimation() {
    this.animationIsPaused = false
    this.bvhAnimationsArray.playAllAnimations()
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
    if (this.bvhAnimationsArray.contains(objectUuid_)) {
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
    if (this.bvhAnimationsArray.contains(objectUuid_)) {
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
    if (this.bvhAnimationsArray.contains(objectUuid_)) {
      this.bvhAnimationsArray.modifyOneBVHFTimeSlider(objectUuid_, newValue)
    } else {
      //FBX
    }
  }

  /** Modifie la visibilité de l'élément du player donné
   * @param {UUID} objectUuid_ Identifiant de l'object à modifier dans la scene
   * @param {Boolean} newValue Object devient visible si true, sinon il devient invisible
   */
  toggleObjectInListVisibility(objectUuid_, newValue) {
    if (this.bvhAnimationsArray.contains(objectUuid_)) {
      if (newValue === true) this.bvhAnimationsArray.getByUUID(objectUuid_).show()
      else this.bvhAnimationsArray.getByUUID(objectUuid_).hide()
    } else {
      //FBX
    }
  }

  /**
   * Supprime les éléments correspondants à leurs animationArray, du player et des listes graphique.
   * @param {UUID} objectUuids_ Set des UUID correspondant aux éléments à supprimer
   */
  deleteObjectsFromPlayer(objectUuids_) {
    objectUuids_.forEach((uuid) => {
      if (this.bvhAnimationsArray.contains(uuid)) {
        this.scene.remove(this.bvhAnimationsArray.getByUUID(uuid).skeleton)
        this.bvhAnimationsArray.removeByUUID(uuid)
        $("#" + uuid).remove()
      } else {
        //FBX if ...
      }
    })
  }

  /**Parse le skelette et fourni une liste de listes HTML correspondant au squelette (sous forme de string)
   * @param {THREE.Skeleton}
   * @returns {String} le squelette sous forme de liste de liste HTML
   */
  _browseThroughBVHSkeleton(skeleton_) {
    let recursiveNavigation = (object) => {
      let result = ""
      object.children.forEach((obj) => {
        if (!(obj.name === "ENDSITE")) {
          if (obj.children[0] === "ENDSITE") result = result + "<li><p>" + obj.name + "</p></li>"
          else result = result + "<li><p>" + obj.name + "</p><ul>" + recursiveNavigation(obj) + "</ul>" + "</li>"
        }
      })
      return result
    }

    return "<p>" + skeleton_.bones[0].name + "</p><ul>" + recursiveNavigation(skeleton_.bones[0]) + "</ul>"
  }

  /**
   * Lance la fenêtre de contrôle avancé qui agira sur l'ensemble des éléments correspondants aux UUIDs donnés
   * Attention ne pas l'utiliser en hétérogène avec des BVH et des FBX
   * @param {UUID} objectUuids_ 
   */
  launchAdvancedControls(objectUuids_) {
    if ($("#advencedControlForBVH").length == 0) {
      let arrayClone = [...objectUuids_] //cast de set en array ou simple clone d'array
      console.log(arrayClone)
      if (arrayClone.every((value) => this.bvhAnimationsArray.contains(value))) {
        if (arrayClone.length == 1) $("body").append('<div id="advencedControlForBVH" title="Advanced Controls"></div>')
        else $("body").append('<div id="advencedControlForBVH" title="Advanced Controls (multiple elements)"></div>')

        //todo remettre éléments
        $("#advencedControlForBVH").append(this.bvhAdvancedCtrlContent)

        $("#speedRatioSelector").change((object) => {
          let newTimeScaleValue = object.target.valueAsNumber
          console.log(newTimeScaleValue)
          arrayClone.forEach((uuid) => {
            this.bvhAnimationsArray.getByUUID(uuid).speedRatio = newTimeScaleValue
          })
        })

        arrayClone.forEach((uuid) => {
          let hierarchyString = this._browseThroughBVHSkeleton(this.bvhAnimationsArray.getByUUID(uuid).skeleton)
          console.log(hierarchyString)
          $("#advencedControlForBVH #graphs").append(hierarchyString)
          $("#advencedControlForBVH #selection").append(hierarchyString)
        })

        $("#advancedControlsTabsForBVH").tabs()

        $("#advencedControlForBVH").dialog({
          height: 480,
          width: 640,
          close: (event, ui) => {
            arrayClone.forEach((uuid) => {
              $("#" + uuid).css("background-color", "white")
            })
            $("#advencedControlForBVH").empty()
            $("#advencedControlForBVH").remove()
            this.bvhAnimationsArray.highlightElements()
          }
        })

      }
    } else { //if arrayClone.every((value) => this.fbxAnimationsArray.contains(value)) ...
      //FBX ----
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