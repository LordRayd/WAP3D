class IEM {
  constructor(player, cameraControls) {
    this.player = player
    this.cameraControls = cameraControls
    this.playerAnimating = true

    this.iemIsBlocked = false
  }

  /**
   * Fonction appellée pour "ouvrir" la div de sélection d'élements
   */
  _openObjectListAction() {
    if (this.iemIsBlocked) return
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

  /**
   * Fonction appellée pour minimiser la div de sélection d'élements
   */
  closeObjectListAction() {
    if (this.iemIsBlocked) return
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

  /** TODO */
  keydownAction(keyEvent) {
    if (this.iemIsBlocked) return
    let keyPressed = keyEvent.originalEvent.key.toUpperCase()
    switch (keyPressed) {
      case "Z":
      case "Q":
      case "S":
      case "D":
        // Déjà utiliser par le déplacement de la caméra
        break
      case " ":
        this.clickOnPlayAction()
        break
      case "SHIFT":
        this.cameraControls.screenSpacePanning = true
        this.cameraControls.keys.UP = 90 // Z
        this.cameraControls.keys.BOTTOM = 83 // S
        break
    }
  }

  /** TODO */
  keyupAction(keyEvent) {
    if (this.iemIsBlocked) return
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
    }
  }

  /** TODO */
  // TODO à modifier pour être utilisé dans les listes
  clickOnGlobalPlayPauseAction() {
    if (this.iemIsBlocked) return
    this.playerAnimating = this.player.toggleAnimation()
  }

  /** TODO */
  // TODO à modifier pour être utilisé dans les listes
  clickOnGlobalReplayAction() {
    if (this.iemIsBlocked) return
    this.player.bvhAnimationsArray.setAllBvhFrameTime(0)
    this.player.restartAnimation()
  }

  /** TODO */
  clickOnPlayPauseAction(event) {
    if (this.iemIsBlocked) return
    let objectId = event.target.parentNode.parentNode.parentNode.id
    this.player.toggleObjectInListAnimation(objectId)
  }

  /** TODO */
  clickOnReplayAction(event) {
    if (this.iemIsBlocked) return
    let objectId = event.target.parentNode.parentNode.parentNode.id
    this.player.replayObjectInListAnimation(objectId)
  }

  /** TODO */
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

  /** TODO*/
  selectElementFromListAction(objectId_) {
    if (this.iemIsBlocked) return
    //TODO prendre en compte si plusieurs éléments sont selectionné pour les contrôles avancés
    // en gros le cas où on fait CTRL+clic / shift+Clic sur plusieurs éléments puis entré
    this.player.launchAdvancedControls(objectId_)
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