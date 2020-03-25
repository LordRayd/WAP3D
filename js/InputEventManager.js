class IEM {
  constructor(player, cameraControls) {
    this.player = player
    this.cameraControls = cameraControls
    this.playerAnimating = true
    this.globalTimeSlider = $("#globalTimeSlider")[0]
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
  clickOnGlobalPlayPauseAction() {
    this.playerAnimating = this.player.toggleAnimation()
  }

  /** TODO */
  clickOnGlobalReplayAction() {
    let generalSliderMin = this.globalTimeSlider.min
    this.globalTimeSlider.valueAsNumber = generalSliderMin
    this.player.bvhAnimationsArray.setAllBvhFrameTime(generalSliderMin)
    this.player.restartAnimation()
  }

  /** TODO */
  clickOnPlayPauseAction(event) {
    let objectId = event.target.parentNode.parentNode.id
    this.player.toggleObjectInListAnimation(objectId)
  }

  /** TODO */
  clickOnReplayAction(event) {
    let objectId = event.target.parentNode.parentNode.id
    this.player.replayObjectInListAnimation(objectId)
  }

  /** TODO */
  modifyGlobalTimeSliderAction(event) {
    console.log(event.currentTarget.valueAsNumber)
    let currPlayingAnim = this.playerAnimating
    if (currPlayingAnim == true) {
      this.playerAnimating = this.player.toggleAnimation()
    }

    let currGeneralTimerValue = this.globalTimeSlider.valueAsNumber
    this.player.bvhAnimationsArray.setAllBvhFrameTime(currGeneralTimerValue)

    if (currPlayingAnim == true) {
      this.playerAnimating = this.player.toggleAnimation()
    }
  }

  /** TODO */
  modifyTimeSliderAction(event){
    let newValue = event.currentTarget.valueAsNumber
    let objectId = event.target.parentNode.id
    console.log(newValue, objectId)
    this.player.modifyObjectInListTimeSlider(objectId, newValue)
  }

  /** TODO */
  modifyWindowSizeAction() {
    this.player.updateRendererSize()
  }
}