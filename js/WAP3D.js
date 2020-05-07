class Player {

  /** Joue les animations quand elles existent
   *  Initialise les interactions à la souris et au clavier
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

    //contenu de la fenêtre de contrôles avancés
    this.bvhAdvancedCtrlContent = $('\
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
            <li><input id="speedRatioSelector" type="number" step="0.25" min="0" onkeypress="return event.charCode != 45"></li>\
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
      </div>')
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
   *  @param {FileLoader} loader
   *  @param {AnimationArray} animationArray tableau d'animation
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
  }

  /** Modifie la visibilité de tout les bvh de la scène 
   * 
   *  @param {Boolean} newValue Tout les BVH sont visible si true, ils sont tous invisible sinon
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
          this.fbxAnimationsArray.showAllAnimations(show)
        } else {
          this.fbxAnimationsArray.hideAllAnimations(hide)
        }
        break
      default:
        throw new Error("Unknown type of list")
    }
  }

  /** TODO */
  toggleAnimation(listName) {
    if (this.animationIsPaused) this.resumeAnimation(listName)
    else this.pauseAnimation(listName)
  }

  /** TODO */
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

  /** TODO */
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

  /** TODO */
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

  /** TODO */
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
   *  @param objectUuid_ Identifiant de l'object selectionner dans la scene
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
   *  @param objectUuid_ Identifiant de l'object selectionner dans la scene
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
   *  @param objectUuid_ Identifiant de l'object selectionner dans la scene
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
        //FBX if ...
      }
    })
  }

  /** Parse le skelette et fourni une liste de listes HTML correspondant au squelette (sous forme de string)
   * 
   *  @param {THREE.Skeleton}
   *  @param {String} additionalTag_ Balise supplémentaire optionnelle
   * 
   *  @returns {String} le squelette sous forme de liste de liste HTML
   */
  _browseThroughBVHSkeleton(skeleton_, additionalTag_ = "") {
    let uuid = skeleton_.uuid
    let recursiveNavigation = (object) => {
      let result = ""
      object.children.forEach((obj) => {
        if (!(obj.name === "ENDSITE")) {
          if (obj.children[0] === "ENDSITE") result = result + '<li><div data-uuid="' + uuid + '"><p>' + obj.name + "</p>" + additionalTag_ + "</div></li>"
          else result = result + '<li><div data-uuid="' + uuid + '"><p>' + obj.name + "</p>" + additionalTag_ + "</div><ul>" + recursiveNavigation(obj) + "</ul>" + "</li>"
        }
      })
      return result
    }

    return '<div data-uuid="' + uuid + '"><p>Hips</p>' + additionalTag_ + '</div><ul>' + recursiveNavigation(skeleton_.bones[0]) + "</ul>"
  }

  /** Renvoie le graph des translations X Y Z de la node "Hips" du BVH correspondant au UUID donné, exploitable par plotly.js
   * 
   *  @param {UUID} targetUUID_ Le UUID du BVH cible
   */
  _bvhTranslationGraphData(targetUUID_) {
    let graphData = [...this.bvhAnimationsArray.getByUUID(targetUUID_).clip._actions[0]._clip.tracks[0].values.values()]
    let xAxis = Array(Math.floor(graphData.length / 3)).keys()

    return [{
      x: xAxis,
      y: graphData.map((val, index) => { if (index % 3 === 0) return val }),
      marker: { color: 'red' },
      name: 'X',
      mode: 'markers',
      simplify: true
    }, {
      x: xAxis,
      y: graphData.map((val, index) => { if (index % 3 === 1) return val }),
      marker: { color: 'green' },
      name: 'Y',
      mode: 'markers',
      simplify: true
    }, {
      x: xAxis,
      y: graphData.map((val, index) => { if (index % 3 === 2) return val }),
      marker: { color: 'blue' },
      name: 'Z',
      mode: 'markers',
      simplify: true
    }]
  }

  /** Renvoie le graph des rotations X Y Z de la node donnée du BVH correspondant au UUID donné, exploitable par plotly.js
   * 
   *  @param {UUID} targetUUID_ Le UUID du BVH cible
   *  @param {String} nodeName_ le nom du noeud à observer
   */
  _bvhRotationGraphData(nodeName_, targetUUID_) {

    let nameInClip = ".bones[" + nodeName_ + "].quaternion"
    let graphData = this.bvhAnimationsArray.getByUUID(targetUUID_).clip._actions[0]._clip.tracks.filter((elem) => elem.name == nameInClip).flatMap((elem) => [...elem.values.values()])
    let xAxis = Array(Math.floor(graphData.length / 3)).keys()

    return [{
      x: xAxis,
      y: graphData.map((val, index) => { if (index % 4 === 0) return val }),
      marker: { color: 'red' },
      name: 'X',
      mode: 'markers',
      simplify: true
    }, {
      x: xAxis,
      y: graphData.map((val, index) => { if (index % 4 === 1) return val }),
      marker: { color: 'green' },
      name: 'Y',
      mode: 'markers',
      simplify: true
    }, {
      x: xAxis,
      y: graphData.map((val, index) => { if (index % 4 === 2) return val }),
      marker: { color: 'blue' },
      name: 'Z',
      mode: 'markers',
      simplify: true
    }, {
      x: xAxis,
      y: graphData.map((val, index) => { if (index % 4 === 3) return val }),
      marker: { color: 'grey' },
      name: 'W',
      mode: 'markers',
      simplify: true
    }]
  }

  /** Lance la fenêtre de contrôle avancé qui agira sur l'ensemble des éléments correspondants aux UUIDs donnés
   *  Attention ne pas l'utiliser en hétérogène avec des BVH et des FBX
   * 
   *  @param {UUID} objectUuids_ 
   */
  launchAdvancedControls(objectUuids_) {

    let arrayClone = [...objectUuids_]

    if (arrayClone.every((value) => this.bvhAnimationsArray.contains(value))) {
      if ($("#advancedControlForBVH").length == 0) {

        arrayClone.forEach((uuid) => {
          this.toggleObjectInListVisibility(uuid, true)
          $("#" + uuid + " .display").prop("checked", true)
        })

        if (arrayClone.length == 1) $("body").append('<div id="advancedControlForBVH" title="Advanced Controls"></div>')
        else $("body").append('<div id="advancedControlForBVH" title="Advanced Controls (multiple elements)"></div>')

        $("#advancedControlForBVH").append(this.bvhAdvancedCtrlContent)

        $("#speedRatioSelector").change((object) => {
          let newTimeScaleValue = object.target.valueAsNumber
          arrayClone.forEach((uuid) => {
            this.bvhAnimationsArray.getByUUID(uuid).speedRatio = newTimeScaleValue
          })
        })

        arrayClone.forEach((uuid) => {
          let graphsHierarchyString = this._browseThroughBVHSkeleton(this.bvhAnimationsArray.getByUUID(uuid).skeleton)
          let displayHierarchyString = this._browseThroughBVHSkeleton(this.bvhAnimationsArray.getByUUID(uuid).skeleton, '<input type="checkbox" checked>')

          $("#advancedControlForBVH #graphs").append('<div class="BVHCtrlList"><p class="title">' + this.bvhAnimationsArray.getByUUID(uuid).name + '</p>' + graphsHierarchyString + '</div>')
          $("#advancedControlForBVH #selection").append('<div class="BVHCtrlList"><p class="title">' + this.bvhAnimationsArray.getByUUID(uuid).name + '</p>' + displayHierarchyString + '</div>')
        })

        $("#advancedControlForBVH .BVHCtrlList input").on("click", (event) => {
          //TODO à bouger dans IEM
          //TODO trouver un moyen de le faire marcher
        })

        $("#advancedControlForBVH #orthoEnabled").on("click", (event) => {
          let isEnabled = $(event.target).is(":checked")
          arrayClone.forEach((uuid) => {
            this.bvhAnimationsArray.getByUUID(uuid).skeleton.bones.forEach(elem => elem.axis.visible = isEnabled)
          })
        })

        $("#advancedControlForBVH .BVHCtrlList div").on("dblclick", (event) => {
          let nodeName = event.target.textContent
          //TODO Déplacer tout ça dans IEM
          $("body").append('<div id="nodeGraph" title="Node Observation Window (' + nodeName + ')"></div>')
          $("#nodeGraph").dialog({
            height: 640,
            width: 640,
            close: (event, ui) => {
              $("#nodeGraph").empty()
              $("#nodeGraph").remove()
            }
          })
          let targetUUID = $(event.target.parentElement).attr("data-uuid")
          if (nodeName == "Hips") {
            Plotly.react($("#nodeGraph")[0], this._bvhTranslationGraphData(targetUUID));
          } else {
            Plotly.react($("#nodeGraph")[0], this._bvhRotationGraphData(nodeName, targetUUID));
          }
        })

        $("#advancedControlsTabsForBVH").tabs()

        $("#advancedControlForBVH").dialog({
          height: 480,
          width: 640,
          close: (event, ui) => {
            arrayClone.forEach((uuid) => {
              $("#" + uuid).css("background-color", "white")
            })
            $("#advancedControlForBVH").empty()
            $("#advancedControlForBVH").remove()
            this.bvhAnimationsArray.highlightElements()
          }
        })

      }
    } else { //if arrayClone.every((value) => this.fbxAnimationsArray.contains(value)) ...
      //FBX ----
      console.log("FBX !")
    }
  }
}