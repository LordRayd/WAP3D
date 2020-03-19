class IEM {
  constructor(player) {
    this.player = player
    this.playerAnimating = this.player.startAnimation()
    this.generalTimeSlider = $("#time-slider")[0]
    this.pauseDiv = $('<div><img src="./images/pause_button.svg"></div>')
    this.playDiv = $('<div><img src="./images/play_button.svg"></div>')
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
        this.player.clickOnPlayAction()
        break
      case "SHIFT":
        this.player.mouseControls.screenSpacePanning = true
        this.player.mouseControls.keys.UP = 90 // Z
        this.player.mouseControls.keys.BOTTOM = 83 // S
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
        this.player.mouseControls.screenSpacePanning = false
        this.player.mouseControls.keys.UP = 90 // Z
        this.player.mouseControls.keys.BOTTOM = 83 // S
        break
    }
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

  /** TODO */
  clickOnPlayAction() {
    this.playerAnimating = this.player.toggleAnimation()
    this.player.framerateTimeReference = -1
    if (this.playerAnimating == false) {
      $("#play").children().replaceWith(this.playDiv)
        // $("#messagePlayer").html(this.playDiv).show(500).hide(500)
    } else {
      $("#play").children().replaceWith(this.pauseDiv)
        // $("#messagePlayer").html(this.pauseDiv).show(500).hide(500)
    }
  }

  /** TODO */
  clickOnReplayAction() {
    let currPlayingAnim = this.playerAnimating
    if (currPlayingAnim == true) {
      this.playerAnimating = this.player.toggleAnimation()
    }
    this.player.framerateTimeReference = -1

    let generalSliderMin = this.generalTimeSlider.min
    this.generalTimeSlider.valueAsNumber = generalSliderMin
    this.player.setAllBvhFrameTime(generalSliderMin)

    if (currPlayingAnim == true) {
      this.playerAnimating = this.player.toggleAnimation()
    }
  }

  /** TODO */
  advanceTimeBar() {
    let currPlayingAnim = this.playerAnimating
    if (currPlayingAnim == true) {
      this.playerAnimating = this.player.toggleAnimation()
    }

    let currGeneralTimerValue = this.generalTimeSlider.valueAsNumber
    this.player.setAllBvhFrameTime(currGeneralTimerValue)

    if (currPlayingAnim == true) {
      this.playerAnimating = this.player.toggleAnimation()
    }
  }

  /** TODO */
  updateRendererSize(){
    this.player.updateRendererSize()
  }
}