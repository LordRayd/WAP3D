/**
 * Object principal de WAP3D, gère les animations, l'affichage de la scène et la gestion des objets en mémoire
 *  
 */
class Player {

  /** Joue les animations quand elles existent
   *  Initialise les interactions à la souris et au clavier
   * 
   * @param {THREE.Scene} scene La scene qui sera utilisé
   * @param {THREE.WebGLRenderer} renderer Le rendu
   * @param {THREE.PerspectiveCamera} camera La camera utilisé
   * @param {THREE.OrbitControls} cameraControls Les controles caméra qui seront utilisés
   * @param {BVHAnimationArray} bvhAnimationsArray La liste qui contiendra les animations bvh
   * @param {FBXAnimationArray} fbxAnimationsArray La liste qui contiendra les animations fbx
   */
  constructor(scene, renderer, camera, cameraControls, bvhAnimationsArray, fbxAnimationsArray) {
    this.scene = scene
    this.renderer = renderer
    this.referenceAxis = new THREE.AxesHelper(100);
    this.camera = camera
    this.cameraControls = cameraControls

    /** liste des conteneurs */
    this.animationsArrays = []

    /** Ajout du conteneur de bvh */
    this.bvhAnimationsArray = bvhAnimationsArray
    this.animationsArrays.push(bvhAnimationsArray)

    /** Ajout du conteneur de fbx */
    this.fbxAnimationsArray = fbxAnimationsArray
    this.animationsArrays.push(fbxAnimationsArray)

    this._initialisePlayer()

    this.bvhLoader = new BVHLoader(this.scene, this.bvhAnimationsArray)
    this.fbxLoader = new FBXLoader(this.scene, this.fbxAnimationsArray);

    this.animating = true
    this.animationIsPaused = true

    this._animate()
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

    //Affichage des Axes

    this.referenceAxis.material.linewidth = 4
    this.referenceAxis.visible = false
    this.scene.add(this.referenceAxis);

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

    // BVH ---
    this._updateAnimation(this.bvhLoader, this.bvhAnimationsArray, "bvh")

    // FBX ---
    this._updateAnimation(this.fbxLoader, this.fbxAnimationsArray, "fbx")

    this.animating = false
    this.renderer.render(this.scene, this.camera)
  }

  /** Demande la mise à jour des éléments contenu dans le tableau d'animation entré en paramètre
   *  Si il y a des fichiers chargé, et qu'il y a au moins un élément à animer, l'animation continue ou se relance si elle était en pause.
   * 
   *  @param {FileLoader} loader Le module de chargement utilisé
   *  @param {AnimationArray} animationArray Le tableau d'animation à mettre à jour
   *  @param {string} listName bvh ou fbx
   */
  _updateAnimation(loader, animationArray, listName) {
    if (loader.loadingState === "loaded") {
      let atLeastOneElementToAnimate = animationArray.updateAllElementsAnimation()
      if (this.animationIsPaused == false && atLeastOneElementToAnimate == false) {
        this.pauseAnimation(listName) // toutes les animations ont fini de jouer
      } else if (this.animationIsPaused && atLeastOneElementToAnimate) {
        // reprise de la lecture => le lecteur est en pause mais un ou plusieur BVH de la liste ont été remis en lecture
        this.animationIsPaused = false
        this._updateGeneralPlayPauseImg()
      }
    }
  }

  /** Lance le chargement de fichier a partir d'un evenement de selectioner de fichier entre en parametre
   * 
   *  @param event evenement de selection de fichier
   *  @param {string} objectType Le type de fichier à charger (bvh ou fbx)
   *  
   *  @return une promesse
   *   - resolue si le(s) fichier(s) à bien été chargé(s)
   *   - rejeté si un fichier à rencontrer un problème lors de son chargement
   */
  loadFile(event, objectType) {
    return new Promise(async (resolve, reject) => {
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
    this.camera.updateProjectionMatrix()
  }

  /** Modifie la visibilité de tout les éléments de la scène choisit par l'attribut listName
   * 
   *  @param {string} listName fbx ou bvh
   *  @param {Boolean} newValue Tout les éléments sont visible si true, ils sont tous invisible sinon
   */
  toggleListVisibility(listName, newValue) {
    switch (listName) {
      case "bvh":
        if (newValue === true) {
          this.bvhAnimationsArray.showAllAnimations()
        } else {
          this.bvhAnimationsArray.hideAllAnimations()
        }
        break
      case "fbx":
        if (newValue === true) {
          this.fbxAnimationsArray.showAllAnimations()
        } else {
          this.fbxAnimationsArray.hideAllAnimations()
        }
        break
      default:
        throw new Error("Unknown type of list")
    }
  }

  /** Met les éléments definit par listName en pause si il sont en lecture et inversement
   *
   * @param {string} listName bvh ou fbx ou all
   */
  toggleAnimation(listName) {
    if (this.animationIsPaused) this.resumeAnimation(listName)
    else this.pauseAnimation(listName)
  }

  /** Lance la lecture de tous les éléments choisit par listName
   * 
   * @param {string} listName bvh ou fbx ou all
   */
  playAnimation(listName) {
    switch (listName) {
      case "bvh":
        this.bvhAnimationsArray.playAllAnimations()
        if (this.fbxAnimationsArray.atLeastOneAnimationToPlay() == false) { this.animationIsPaused = false }
        break
      case "fbx":
        this.fbxAnimationsArray.playAllAnimations()
        if (this.bvhAnimationsArray.atLeastOneAnimationToPlay() == false) { this.animationIsPaused = false }
        break
      default:
        this.animationsArrays.forEach(list => list.playAllAnimations())
        this._updateGeneralPlayPauseImg()
    }
    this.animationIsPaused = false
  }

  /** Met en pause tous les éléments choisit par listName
   * 
   * @param {string} listName bvh ou fbx ou all
  */
  pauseAnimation(listName) {
    switch (listName) {
      case "bvh":
        this.bvhAnimationsArray.pauseAllAnimations()
        break
      case "fbx":
        this.fbxAnimationsArray.pauseAllAnimations()
        break
      default:
        this.animationsArrays.forEach(list => list.pauseAllAnimations())
        this._updateGeneralPlayPauseImg()
    }
    let allEltsPaused = false
    this.animationsArrays.some(list => {
      if (list.atLeastOneAnimationToPlay() == true) {
        this.animationIsPaused = false
        allEltsPaused = false
      } else {
        allEltsPaused = true
      }
      return !allEltsPaused
    })
    if (allEltsPaused) { this.animationIsPaused = true }
  }

  /** Fait reprendre la lecture à tous les éléments qui sont en pause de la listName chosit
   * 
   * @param {string} listName bvh ou fbx ou all
   */
  resumeAnimation(listName) {
    let allEltsPaused = true
    switch (listName) {
      case "bvh":
        if (this.bvhAnimationsArray.resumeAllAnimations() == true) { allEltsPaused = false }
        break
      case "fbx":
        if (this.fbxAnimationsArray.resumeAllAnimations() == true) { allEltsPaused = false }
        break
      default:
        this.animationsArrays.forEach(elt => {
          if (elt.resumeAllAnimations() == true) { allEltsPaused = false }
        })
        this._updateGeneralPlayPauseImg()
    }
    this.animationIsPaused = false
    if (allEltsPaused) this.playAnimation(listName)
  }

  /** Lance la réinitialisation de la lecture de tous les éléments de la listName chosit
   * 
   * @param {string} listName bvh ou fbx ou all
   */
  replayAnimation(listName) {
    let animationWasPlaying = !this.animationIsPaused
    switch (listName) {
      case "bvh":
        this.bvhAnimationsArray.replayAllAnimations(animationWasPlaying)
        break
      case "fbx":
        this.fbxAnimationsArray.replayAllAnimations(animationWasPlaying)
        break
      default:
        this.animationsArrays.forEach(elt => elt.replayAllAnimations(animationWasPlaying))
    }
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
   *  @param {UUID} objectUuid_ Identifiant de l'object selectionner dans la scene
   */
  toggleObjectInListAnimation(objectUuid_) {
    if (this.bvhAnimationsArray.contains(objectUuid_)) {
      this.bvhAnimationsArray.toggleOneAnimation(objectUuid_)
    } else {
      this.fbxAnimationsArray.toggleOneAnimation(objectUuid_)
    }
  }

  /** Relance l'animation depuis le debut pour un element selectionner du player
   * 
   *  @param {UUID} objectUuid_ Identifiant de l'object selectionner dans la scene
   */
  replayObjectInListAnimation(objectUuid_) {
    if (this.bvhAnimationsArray.contains(objectUuid_)) {
      this.bvhAnimationsArray.replayOneAnimation(objectUuid_)
    } else {
      this.fbxAnimationsArray.replayOneAnimation(objectUuid_);
    }
  }

  /** Met a jour le time slider d'un element du player slectionner avec la nouvelle valeur entré en paramètre
   * 
   *  @param {UUID} objectUuid_ Identifiant de l'object selectionner dans la scene
   *  @param newValue Nouvelle valeur du time slider
   */
  updateObjectInListTimeSlider(objectUuid_, newValue_) {
    if (this.bvhAnimationsArray.contains(objectUuid_)) {
      this.bvhAnimationsArray.updateOneTimeSlider(objectUuid_, newValue_)
    } else {
      this.fbxAnimationsArray.updateOneTimeSlider(objectUuid_, newValue_);
    }
  }

  /** Modifie la visibilité de l'élément du player donné
   *
   *  @param {UUID} objectUuid_ Identifiant de l'object à modifier dans la scene
   *  @param {Boolean} newValue Object devient visible si true, sinon il devient invisible
   */
  toggleObjectInListVisibility(objectUuid_, newValue_) {
    if (this.bvhAnimationsArray.contains(objectUuid_)) {
      if (newValue_ === true) this.bvhAnimationsArray.getByUUID(objectUuid_).show()
      else this.bvhAnimationsArray.getByUUID(objectUuid_).hide()
    } else {
      if (newValue_ === true) this.fbxAnimationsArray.getByUUID(objectUuid_).show()
      else this.fbxAnimationsArray.getByUUID(objectUuid_).hide()
    }
  }

  /** Supprime les éléments correspondants à leurs animationArray, du player et des listes graphique.
   * 
   *  @param {UUID} objectUuids_ Set des UUID correspondant aux éléments à supprimer
   */
  deleteObjectsFromPlayer(objectUuids_) {
    objectUuids_.forEach((uuid) => {
      if (this.bvhAnimationsArray.contains(uuid)) {
        this.scene.remove(this.bvhAnimationsArray.getByUUID(uuid).skeleton)
        this.bvhAnimationsArray.removeByUUID(uuid)
        $("#" + uuid).remove()
      } else {
        this.scene.remove(this.scene.getObjectByProperty('uuid', uuid));
        this.fbxAnimationsArray.removeByUUID(uuid)
        $("#" + uuid).remove()
      }
    })
  }

  /** Lance la fenêtre de contrôle avancé qui agira sur l'ensemble des éléments correspondants aux UUIDs donnés
   *  Attention ne pas l'utiliser en hétérogène avec des BVH et des FBX
   * 
   *  @param {UUID} objectUuids_ 
   */
  launchAdvancedControls(objectUuids_) {
    if (this.bvhAnimationsArray.contains(objectUuids_[0])) {
      let acw = new AdvancedControlWindow(objectUuids_, "bvh", this)
      acw.launch()
    } else if (this.fbxAnimationsArray.contains(objectUuids_[0])) {
      let acw = new AdvancedControlWindow(objectUuids_, "fbx", this)
      acw.launch()
    }
  }

}