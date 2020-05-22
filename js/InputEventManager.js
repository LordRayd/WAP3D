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

  /** Ouvre la div de sélection d'élements */
  _openObjectListAction() {
    if (this.iemIsBlocked) return
    $("#closeOpenButton img").attr("src", "./images/close_button.svg")

    $("#objectSelector").animate({ width: '30%', height: '100%', top: '0' }, {
      duration: 100,
      complete: _ => {
        $("#closeOpenButton").one("click", event => this.closeObjectListAction(event))
        $("#closeOpenButton").css({ "width": "5%", "height": "5%", "top": "47.5%" })
      }
    })

    $("#objectSelector").children().not("#closeOpenButton").fadeIn(100)

    $("#messagePlayer").animate({ width: '59%' }, {
      duration: 100,
    })
  }

  /** Minimise la div de sélection d'élements */
  closeObjectListAction() {

    $("#closeOpenButton img").attr("src", "./images/open_button.svg")

    $("#objectSelector").animate({ width: '1.5%', height: '5%', top: '47.5%' }, {
      duration: 100,
      complete: _ => {
        $("#closeOpenButton").one("click", event => this._openObjectListAction(event))
        $("#closeOpenButton").css({ "width": "100%", "height": "100%", "top": "0" })
      }
    })

    $("#objectSelector").children().not("#closeOpenButton").fadeOut(100)

    $("#messagePlayer").animate({ width: '84%' }, {
      duration: 100,
    })
  }

  /** 
   *  @param {*} keyEvent La touche pressée
   */
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
      case 'R':
        this.player.referenceAxis.visible = !this.player.referenceAxis.visible
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
        if (this.currentlySelectedElements.size > 0 && $("#advancedControlForBVH").length == 0 && $("#advancedControlForFBX").length == 0) {
          this.player.launchAdvancedControls([...this.currentlySelectedElements])
        }
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
      case "CONTROL":
        //selection ctrls avancés
        this.isOnAppendSelectionMode = false
        break
    }
  }

  /**Demande au player de toggle la mise en pose de la scène */
  clickOnGlobalPlayPauseAction() {
    if (this.iemIsBlocked) return
    this.player.toggleAnimation("all")
  }

  /**Demande au player de reset les animations de la scène */
  clickOnGlobalReplayAction() {
    if (this.iemIsBlocked) return
    this.player.replayAnimation("all")
  }

  /** Demande au player de mettre en route tout les BVH */
  clickOnListPlayAction(event) {
    if (this.iemIsBlocked) return
    let listName = event.currentTarget.parentElement.parentElement.id.slice(0, 3).toLowerCase()
    this.player.playAnimation(listName)
  }

  /** Demande au player de mettre en pause tout les BVH */
  clickOnListPauseAction(event) {
    if (this.iemIsBlocked) return
    let listName = event.currentTarget.parentElement.parentElement.id.slice(0, 3).toLowerCase()
    this.player.pauseAnimation(listName)
  }

  /** Demande au player de relancer tout les BVH */
  clickOnListReplayAction(event) {
    if (this.iemIsBlocked) return
    let listName = event.currentTarget.parentElement.parentElement.id.slice(0, 3).toLowerCase()
    this.player.replayAnimation(listName)
  }

  /** Demande au player de toggle la visibilité de tout les BVH */
  clickOnListVisibilityAction(event) {
    if (this.iemIsBlocked) return
    let isVisible = $(event.target).attr("src") != "./images/eye_button.svg"
    let listName = event.currentTarget.parentElement.parentElement.id.slice(0, 3).toLowerCase()
    this.player.toggleListVisibility(listName, isVisible)
  }

  /** Demande au player de mettre en pause l'animation correspondante à l'élément dans lequel le bouton pause à été clické */
  clickOnElementPlayPauseAction(event) {
    if (this.iemIsBlocked) return
    let objectId = event.target.parentNode.parentNode.parentNode.id
    this.player.toggleObjectInListAnimation(objectId)
  }

  /** Demande au player de mettre à la première frame l'animation correspondante à l'élément dans lequel le bouton replay à été clické */
  clickOnElementReplayAction(event) {
    if (this.iemIsBlocked) return
    let objectId = event.target.parentNode.parentNode.parentNode.id
    this.player.replayObjectInListAnimation(objectId)
  }

  /** Demande au player de mettre à la frame correspondante l'animation correspondante à l'élément dans lequel le time slider à été clické */
  modifyElementTimeSliderAction(event) {
    if (this.iemIsBlocked) return
    let newValue = event.target.valueAsNumber
    let objectId = event.target.parentNode.parentNode.id
    this.player.updateObjectInListTimeSlider(objectId, newValue)
  }

  /** Demande au player de toggle la visibilité de l'élément correspondant */
  clickOnElementVisibilityAction(event) {
    if (this.iemIsBlocked) return
    let objectId = event.target.parentNode.parentNode.parentNode.id
    this.player.toggleObjectInListVisibility(objectId, $(event.target).attr("src") != "./images/eye_button.svg")
  }

  /** Demande au player de rajouter des éléments à la liste des éléments modifiable par la fenêtre de ctrl avancés
   * 
   *  @param {event} event
   */
  selectElementFromListAction(event) {
    if (this.iemIsBlocked) return
    let target = event.target
    let object = undefined
    if (target.tagName === "P") {
      object = target.parentNode.parentNode
    } else if (target.className === "titleArea") {
      object = target.parentNode
    }
    $(object).css("background-color", "darkgrey")

    if (typeof object === "undefined") { return }

    if (this.isOnAppendSelectionMode) {
      $("#" + object.id).css("background-color", "darkgrey")
      this.currentlySelectedElements.add(object.id)
    } else {
      this.currentlySelectedElements.forEach((uuid) => {
        $("#" + uuid).css("background-color", "white")
      })
      if (!this.currentlySelectedElements.has(object.id)) {
        this.currentlySelectedElements.clear()
        $("#" + object.id).css("background-color", "darkgrey")
        this.currentlySelectedElements.add(object.id)
      } else {
        this.currentlySelectedElements.clear()
      }
    }
    let selectElementsArray = [...this.currentlySelectedElements]
    if (selectElementsArray.every((uuid) => this.player.bvhAnimationsArray.contains(uuid))) {
      this.player.bvhAnimationsArray.highlightElements(selectElementsArray)
    } else if (selectElementsArray.every((uuid) => this.player.fbxAnimationsArray.contains(uuid))) {
      this.player.fbxAnimationsArray.highlightElements(selectElementsArray)
    } else {
      throw new Error("invalid selection, rappel: les sélections hétérogène ne sont pas autorisées")
    }
  }

  /** TODO */
  modifyWindowSizeAction() {
    if (this.iemIsBlocked) return
    this.player.updateRendererSize()
  }

  /** Demande au player de lancer la fenêtre de contrôles avancés normalement appelé pour un "enter" ou un "dblClick"
   *  
   *  @param {event} event
   */
  openAdvancedControlsAction(event) {
    if (this.iemIsBlocked) return
    let target = event.target
    let listType
    if (target.tagName === "P") {
      listType = target.parentNode.parentNode.parentNode.parentNode.id.slice(0, 3).toLowerCase()

      $(target.parentNode.parentNode).css("background-color", "darkgrey")
      this.player.launchAdvancedControls([target.parentNode.parentNode.id], listType)
    } else if (target.className === "titleArea" || target.className === "controlFunctions") {
      listType = target.parentNode.parentNode.parentNode.id.slice(0, 3).toLowerCase()

      $(target.parentNode).css("background-color", "darkgrey")
      this.player.launchAdvancedControls([target.parentNode.id], listType)
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

  fbx2FileSelectedAction(event){
    this.iemIsBlocked = true
    this.player.loadFile(event, "fbx").then(
      this.iemIsBlocked = false
    )
  }
}