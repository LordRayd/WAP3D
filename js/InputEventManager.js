class IEM {
  constructor(player, cameraControls) {
    this.player = player
    this.cameraControls = cameraControls
    this.playerAnimating = true
  }

  /**
   * Fonction appellée pour "ouvrir" la div de sélection d'élements
   */
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

  /**
   * Fonction appellée pour minimiser la div de sélection d'élements
   */
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

  /** TODO */
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
  //TODO à modifier pour être utilisé dans les listes
  clickOnGlobalPlayPauseAction() {
    this.playerAnimating = this.player.toggleAnimation()
  }

  /** TODO */
  //TODO à modifier pour être utilisé dans les listes
  clickOnGlobalReplayAction() {
    this.player.bvhAnimationsArray.setAllBvhFrame(0)
    this.player.restartAnimation()
  }

  /** TODO */
  clickOnPlayPauseAction(event) {
    let objectId = event.target.parentNode.parentNode.parentNode.id
    this.player.toggleObjectInListAnimation(objectId)
  }

  /** TODO */
  clickOnReplayAction(event) {
    let objectId = event.target.parentNode.parentNode.parentNode.id
    this.player.replayObjectInListAnimation(objectId)
  }

  /** TODO */
  modifyTimeSliderAction(event){
    let newValue = event.currentTarget.valueAsNumber
    let objectId = event.target.parentNode.parentNode.id
    console.log(newValue, objectId)
    this.player.modifyObjectInListTimeSlider(objectId, newValue)
  }

  /** TODO */
  modifyWindowSizeAction() {
    this.player.updateRendererSize()
  }

  /** TODO*/
  selectElementFromListAction(objectId_){
    //TODO prendre en compte si plusieurs éléments sont selectionné pour les contrôles avancés
    // en gros le cas où on fait CTRL+clic / shift+Clic sur plusieurs éléments puis entré
    this.player.launchAdvancedControls(objectId_)
  }
} 