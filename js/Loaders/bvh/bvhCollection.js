/** Array avec des méthodes et attributs en plus dans le but de stocker et d'interagir avec une collection de BVH. */
class BVHAnimationArray extends AnimationArray {

  /** @returns {BVHAnimationElement} l'OBJET ayant le plus grand nombre de frames dans la collection */
  getByMaxNbOfFrames() {
    return this.reduce((bvh0, bvh1) => {
      return bvh0.nbFrames < bvh1.nbFrames ? bvh1 : bvh0
    })
  }

  /** @returns {BVHAnimationElement} l'OBJET ayant l'animation la plus longue (en secondes) de la collection */
  getByMaxOverallTime() {
    return this.reduce((bvh0, bvh1) => {
      return (bvh0.nbFrames * bvh0.frameTime) < (bvh1.nbFrames * bvh1.frameTime) ? bvh1 : bvh0
    })
  }

  /** Met en pause lelement entré en parametre s'il est en lecture, le met en lecture sinon.
   * 
   *  @param {UUID} objectUuid_ Le UUID de l'élément de la collection
   */
  toggleOneBVHAnimation(objectUuid_) {
    this.getByUUID(objectUuid_).toggleAnimation()
  }

  /** Replace un élément entré en paramètre à sa première frame.
   * 
   *  @param {UUID} objectUuid_ Le UUID de l'élément de la collection
   */
  replayOneBVHAnimation(objectUuid_) {
    this.getByUUID(objectUuid_).replayAnimation()
  }

  /** Modifie le time slider d'un object avec sa nouvelle valeur
   *  
   *  @param {UUID} objectUuid_ Le UUID de l'élément de la collection
   *  @param {Number} newValue_ Nouvelle valeur du time slider
   */
  updateOneTimeSlider(objectUuid_, newValue_) {
    this.getByUUID(objectUuid_).updateTimeSlider(newValue_)
  }

  /**  */
  pauseAllAnimations() {
    this.forEach((bvh) => {
      bvh.pauseAnimation()
    })
  }

  /**  */
  playAllAnimations() {
    this.forEach((bvh) => {
      bvh.playAnimation()
    })
  }

  /** 
   *  @returns {Boolean} True si au moins un élément de l'ensemble reprend effectivement son animation, False sinon.
   */
  resumeAllAnimations() {
    let atLeastOneAnimationToPlay = false
    this.forEach((bvh) => {
      if (bvh.resumeAnimation() == true) {
        atLeastOneAnimationToPlay = true
      }
    })
    return atLeastOneAnimationToPlay
  }

  /** Replace l'ensemble des éléments de la collection à leur première frame.
   * 
   *  @param {Boolean} resetResumeAnim si True alors les animations se rejouent, sinon ils restent à la frame 0 (False par défaut).
   */
  replayAllAnimations(resetResumeAnim = false) {
    this.forEach((bvh) => {
      bvh.replayAnimation(resetResumeAnim)
    })
  }

  /** Highlight la collection d'élément donné, si aucune collection n'est fourni ou si elle est vide alors tout les éléments de la scène reprennent leur opacité normale
   *  
   *  @param {Set|Array|null} Uuids_ La collection d'éléments à highlight dans la scène, peut être laissé vide
   */
  highlightElements(Uuids_) {
    let amount
    if (Uuids_) {
      if (Uuids_.constructor.name === "Set") {
        amount = Uuids_.size
      } else {
        amount = Uuids_.length
      }
    } else {
      amount = 0
    }

    if (amount > 0) {
      this.forEach((elem) => {
        elem.opacity = 0.3
      })

      Uuids_.forEach((uuid) => {
        this.getByUUID(uuid).opacity = 1.0
      })
    } else {
      this.forEach((elem) => {
        elem.opacity = 1.0
      })
    }
  }
}

/** Objet contenant l'ensembles des données nécéssaires aux traitement d'un BVH.
 *  Utilisé par BVHAnimationArray
 */
class BVHAnimationElement {
  /**
   *  @param {*} name_ Le nom du BVH
   *  @param {THREE.SkeletonHelper} skeleton_
   *  @param {THREE.AnimationMixer} animationMixer_ 
   *  @param {BVHParser} bvhFile_ 
   */
  constructor(name_, skeleton_, animationMixer_, bvhFile_) {
    this.skeleton = skeleton_
    this.skeleton.receiveShadow = true
    this.skeleton.castShadow = true
    this.clip = animationMixer_
    this.frameTime = bvhFile_.getFrameTime()
    this.nbFrames = bvhFile_.getNbFrames()
    this.name = name_
    this.isPaused = false
    this.resumeAnimationValue = this.isPaused
    this.speedRatio = 1

    // Pause/Play
    this.playPauseButton = $("#" + this.uuid + " .playPause")[0]

    // Time Slider
    this.timeSlider = $("#" + this.uuid + " .timeSlider")[0]
    this.timeSlider.max = this.nbFrames
    this.timeSlider.min = 0
    this.timeSlider.valueAsNumber = this.timeSlider.min

    // Affichage a lecran
    this.isVisible = true

    //prototype sur les bones du skeleton pour ajouter des repères sur chaque node
    this.skeleton.bones.forEach(elem => {
      elem.axis = new THREE.AxesHelper(1) //création et initialisation de l'attribut axis
      elem.axis.material.linewidth = 2
      elem.axis.visible = false
      elem.add(elem.axis)
    })
  }

  /** L'opacité de l'élément, compris entre 0 et 1 */
  get opacity() {
    return this.skeleton.material.opacity
  }

  /** L'opacité de l'élément, compris entre 0 et 1
   * 
   *  @param {Number} 
   */
  set opacity(value_) {
    this.skeleton.material.opacity = value_
  }

  /** Rend le BVH invisible */
  hide() {
    this.skeleton.visible = false
  }

  /** Rend le BVH visible */
  show() {
    this.skeleton.visible = true
  }

  /** Si true alors le bvh produit des ombres */
  get shadowEnabled() {
    return this.skeleton.castShadow
  }

  /**
   * @param {Boolean} value_ Si true alors le bvh produit des ombres
   */
  set shadowEnabled(value_) {
    this.skeleton.castShadow = value_
  }

  /**  */
  toggleAnimation() {
    if (this.isPaused) this.playAnimation()
    else this.pauseAnimation()
    this.resumeAnimationValue = this.isPaused
    this._updatePlayPauseImg()
  }

  /**  */
  playAnimation() {
    this.isPaused = false
    this._updatePlayPauseImg()
  }

  /**  */
  pauseAnimation() {
    this.isPaused = true
    this._updatePlayPauseImg()
  }

  /**  */
  resumeAnimation() {
    this.isPaused = this.resumeAnimationValue
    this._updatePlayPauseImg()
    return !this.isPaused
  }

  /** Replace le timeSlider du BVH au début et rejoue ou non lanimation en fonction du paramètre
   * 
   *  @param {Boolean} resetResumeAnim True si l'animation se rejoue, False si l'animation reste en pause.
   */
  replayAnimation(resetResumeAnim) {
    if (resetResumeAnim == true) this.resumeAnimationValue = false
    this.timeSlider.valueAsNumber = this.timeSlider.min
    this.clip.setTime(this.timeSlider.min)
    this._updatePlayPauseImg()
  }

  /** Met a jour l'image du bouton playPause
   *    - Image de pause si l'object passe en lecture
   *    - Image de lecture si l'object passe en pause
   */
  _updatePlayPauseImg() {
    let img = $('#' + this.uuid + " .playPause")[0].lastChild
    if (this.isPaused) {
      img.src = "./images/play_button.svg"
    } else {
      img.src = "./images/pause_button.svg"
    }
  }

  /** Retourne si le BVH est en pause ou non */
  get isPaused() {
    return this._isPaused
  }

  /**  */
  set isPaused(newValue) {
    if (newValue == false || newValue == true) {
      this._isPaused = newValue
    }
  }

  /** Incrémente la position du time slider si aucun parametre n'est renseigné.
   *  Sinon la valeur du time slider prendre la valeur entrée en paramètre.
   *  
   *  @param {Number} target : Option, noubelle valeur du time slider
   */
  updateTimeSlider(newTime = null) {
    if (newTime) {
      this.timeSlider.valueAsNumber = newTime
      this.clip.timeScale = 1
      this.clip.setTime(this.timeSlider.valueAsNumber * this.frameTime)
    } else {
      this.timeSlider.valueAsNumber += this.clip.timeScale
    }
  }

  /** Retourne l'uuid du BVH */
  get uuid() {
    return this.skeleton.uuid
  }
}