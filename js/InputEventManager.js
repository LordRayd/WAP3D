/**
 * Objet responsable de gérer l'ensemble des interactions au clavier ou à la souris
 */
class IEM {
  /**  */
  constructor(player, cameraControls) {
    this.player = player
    this.cameraControls = cameraControls
    this.playerAnimating = true
    this.currentlySelectedElements = new Set()
    this.isOnAppendSelectionMode = false
  }

  /** Fonction appellée pour ouvrir la div de sélection d'élements */
  _openObjectListAction() {

    $("#objectSelector").animate({ width: '30%', marginRight: '1%' }, {
      duration: 100
    })

    $("#player").animate({ width: '59%' }, {
      duration: 100,
      progress: _ => this.player.updateRendererSize(),
      complete: _ => $("#closeOpenButton").one("click", event => this.closeObjectListAction(event))
    })

    $("#objectSelector").children().not("#closeOpenButton").fadeIn(100)

    $("#messagePlayer").animate({ width: '59%' }, {
      duration: 100,
    })
  }

  /** Fonction appellée pour minimiser la div de sélection d'élements */
  closeObjectListAction() {

    $("#objectSelector").animate({ width: '2%', marginRight: '0.5%' }, {
      duration: 100
    })

    $("#player").animate({ width: '87.5%' }, {
      duration: 100,
      progress: _ => this.player.updateRendererSize(),
      complete: _ => $("#closeOpenButton").one("click", event => this._openObjectListAction(event))
    })

    $("#objectSelector").children().not("#closeOpenButton").fadeOut(100)

    $("#messagePlayer").animate({ width: '84%' }, {
      duration: 100,
    })
  }

  /** 
   * @param {*} keyEvent La touche pressée
   */
  keydownAction(keyEvent) {
    let keyPressed = keyEvent.originalEvent.key.toUpperCase()
    switch (keyPressed) {
      case "Z":
      case "Q":
      case "S":
      case "D":
        // Déjà utiliser par le déplacement de la caméra
        break
      case " ":
        this.clickOnGlobalPlayPauseAction()
        break
      case "SHIFT":
        //player
        this.cameraControls.screenSpacePanning = true
        this.cameraControls.keys.UP = 90 // Z
        this.cameraControls.keys.BOTTOM = 83 // S
        break
      case "CONTROL":
        //selection ctrl avancés
        this.isOnAppendSelectionMode = true
        break
      case 'ENTER':
        if (this.currentlySelectedElements.size > 0) this.openAdvancedControls(this.currentlySelectedElements)
        break
      case 'DELETE':
        this.player.deleteObjectsFromPlayer(this.currentlySelectedElements)
        break

    }
  }

  /**
   *  @param {*} keyEvent La touche relachée
   */
  keyupAction(keyEvent) {
    let keyPressed = keyEvent.originalEvent.key.toUpperCase()
    switch (keyPressed) {
      case "Z":
      case "Q":
      case "S":
      case "D":
        // Déjà utiliser par le déplacement de la caméra
        break
      case "SHIFT":
        this.cameraControls.screenSpacePanning = false
        this.cameraControls.keys.UP = 90 // Z
        this.cameraControls.keys.BOTTOM = 83 // S
        break
      case "CONTROL":
        //selection ctrls avancés
        this.isOnAppendSelectionMode = false
        break
    }
  }

  /** Demande au Player de toggle entre pause et play */
  //TODO à modifier pour être utilisé dans les listes
  clickOnGlobalPlayPauseAction(event) {
    if (this.iemIsBlocked) return
    this.playerAnimating = this.player.toggleAnimation()
  }

  /** Demande au player de mettre toutes les animations à leur première frames */
  //TODO à modifier pour être utilisé dans les listes
  clickOnGlobalReplayAction(event) {
    if (this.iemIsBlocked) return
    this.player.bvhAnimationsArray.setAllBvhTime(0)
    this.player.restartAnimation()
  }

  /** Demande au player de mettre en route tout les BVH */
  clickOnBVHListPlayAction(event) {
    if (this.iemIsBlocked) return
    this.player.playBVHAnimation()
  }

  /** Demande au player de mettre en pause tout les BVH */
  clickOnBVHListPauseAction(event) {
    if (this.iemIsBlocked) return
    this.player.pauseBVHAnimation()
  }

  /** Demande au player de relancer tout les BVH */
  clickOnBVHListReplayAction(event) {
    if (this.iemIsBlocked) return
    this.player.restartBVHAnimation(false)
  }

  /**  */
  clickOnBVHListdisplayAction(event) {

  }

  /** Demande au player de mettre en pause l'animation correspondante à l'élément dans lequel le bouton pause à été clické */
  clickOnPlayPauseAction(event) {
    if (this.iemIsBlocked) return
    let objectId = event.target.parentNode.parentNode.parentNode.id
    this.player.toggleObjectInListAnimation(objectId)
  }

  /** Demande au player de mettre à la première frame l'animation correspondante à l'élément dans lequel le bouton replay à été clické */
  clickOnReplayAction(event) {
    if (this.iemIsBlocked) return
    let objectId = event.target.parentNode.parentNode.parentNode.id
    this.player.replayObjectInListAnimation(objectId)
  }

  /** Demande au player de mettre à la frame correspondante l'animation correspondante à l'élément dans lequel le time slider à été clické */
  modifyTimeSliderAction(event) {
    if (this.iemIsBlocked) return
    let newValue = event.currentTarget.valueAsNumber
    let objectId = event.target.parentNode.parentNode.id
    this.player.modifyObjectInListTimeSlider(objectId, newValue)
  }

  /** TODO */
  modifyWindowSizeAction() {
    if (this.iemIsBlocked) return
    this.player.updateRendererSize()
  }

  /** Demande au player de rajouter des éléments à la liste des éléments modifiable par la fenêtre de ctrl avancés
   * 
   *  @param {UUID} objectId_
   */
  selectElementFromListAction(objectId_) {
    if (this.isOnAppendSelectionMode) {
      $("#" + objectId_).css("background-color", "darkgrey")
      this.currentlySelectedElements.add(objectId_)
    } else {
      this.currentlySelectedElements.forEach((uuid) => {
        $("#" + uuid).css("background-color", "white")
      })
      if (!this.currentlySelectedElements.has(objectId_)) {
        this.currentlySelectedElements.clear()
        $("#" + objectId_).css("background-color", "darkgrey")
        this.currentlySelectedElements.add(objectId_)
      } else {
        this.currentlySelectedElements.clear()
      }
    }
    this.player.bvhAnimationsArray.highlightElements(this.currentlySelectedElements)
    console.log(this.currentlySelectedElements)
  }

  /** Demande au player de lancer la fenêtre de contrôles avancés normalement appelé pour un "enter" ou un "dblClick"
   * 
   * @param {UUID} objectId_
   */
  openAdvancedControls(objectId_) {
    if (objectId_) {
      this.player.launchAdvancedControls(objectId_)
    } else {
      this.player.launchAdvancedControls(this.currentlySelectedElements)
    }
  }

  /** TODO */
  fileSelectedAction(event) {
    let objectType = event.target.accept.lastOf('\.')
    this.iemIsBlocked = true
    this.player.loadFile(event, objectType).then(
      this.iemIsBlocked = false
    )
  }
}