/**
 * Array avec des méthodes et attributs en plus dans le but de stocker et d'interagir avec une collection de BVH.
 */
class BVHAnimationArray extends Array {

  /** Retire l'élément de uuid correspondant de la collection
   *  @param {*} uuid_ 
   */
  removeByUUID(uuid_) {
    this.some((bvhAnimationElem, index) => {
      if (bvhAnimationElem.uuid === uuid_) {
        //TODO supprimer l'élément dans la scène
        this.splice(index, 1)
        return true
      }
    })
  }

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

  /** @param {*} uuid_ Le UUID pour lequel on cherche à trouver un élément correspondant
   *  @returns {BVHAnimationElement} l'élément correspondant au UUID donné si il existe
   */
  getByUUID(uuid_) {
    for (let elem of this) {
      if (elem.uuid === uuid_) {
        return elem
      }
    }
  }

  /** Set la frame entree en parametre comme frame courante pour tout les éléments de la collection.
   *  Si la frame cible donnée par *time* est supérieur à la longueur réel d'un élément alors sa frame courante deviendra sa dernière.
   *  
   *  @param {Number} frame L'index de frame souhaité
   */
  setAllBvhTime(frame) {
    this.forEach(bvh => {
      let newTime = bvh.nbFrames > frame ? bvh.frameTime * frame : bvh.frameTime * bvh.nbFrames
      bvh.clip.setTime(newTime)
    });
  }

  /** Avance l'animation de chacun des éléments de la collection en fonction de si ils sont censé être mis en pause ou non.
   * 
   *  @param {Number} frameTimeReference_ Le frametime de observé du navigateur
   *  @returns {Boolean} True si au moins un élément de la collection n'était pas encore fini, False sinon
   */
  updateAllElementsAnimation(frameTimeReference_) {
    let atLeastOneElementToAnimate = false
    this.forEach(bvhElem => {
      if (bvhElem.timeSlider.valueAsNumber >= bvhElem.nbFrames) {
        bvhElem.isPaused = true
        bvhElem._updatePlayPauseImg()
      }

      if (!bvhElem.isPaused) {
        atLeastOneElementToAnimate = true
        bvhElem.clip.timeScale = (bvhElem.speedRatio * frameTimeReference_) / bvhElem.frameTime
        bvhElem.clip.update(bvhElem.frameTime)
        bvhElem.modifyTimeSlider() // TODO Régler le problème d'imprécision du slider
      }
    });
    return atLeastOneElementToAnimate
  }

  /** Met à jour le mode de rendu de l'ensemble des éléments de la collections en fonctions de leurs propriétés */
  updateAllElementsProperties() {
    this.forEach(bvhElem => {
      if (bvhElem.isVisible) bvhElem.show()
      else bvhElem.hide()
    })
  }

  /** Retourne si l'object entré en paramaetre est présent o non dans la liste. 
   * 
   * @param {UUID} objectUuid_ le UUID à rechercher
   * 
   * @returns {Boolean} True si la collection contient un élément correspondant au UUID donné
   */
  contains(objectUuid_) {
    return this.some((bvh_) => {
      return bvh_.uuid == objectUuid_
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
   *  @param {Number} newValue L'index de frame souhaité
   */
  modifyOneBVHFTimeSlider(objectUuid_, newValue) {
    this.getByUUID(objectUuid_).modifyTimeSlider(newValue)
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
   * @param {Boolean} resetResumeAnim si True alors les animations se rejouent, sinon ils restent à la frame 0 (False par défaut).
   */
  replayAllAnimations(resetResumeAnim = false) {
    this.forEach((bvh) => {
      bvh.replayAnimation(resetResumeAnim)
    })
  }
}

/** Objet contenant l'ensembles des données nécéssaires aux traitement d'un BVH.
 *  Utilisé dans BVHAnimationArray
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
    this.timeSlider.min = 1
    this.timeSlider.valueAsNumber = this.timeSlider.min

    // Affichage a lecran
    this.isVisible = true
  }

  /** Renvoie si l'object est visible ou non.
   * 
   * @return True si la checkbox de visibilité pour cet élément est coché, false sinon.
   */
  get isVisible() {
    return $('#' + this.uuid + " .display").is(":checked")
  }

  /** 
   *  @param value_ : si true alors la checkbox sera coché, inverse sinon
   */
  set isVisible(value_) {
    $('#' + this.uuid + " .display").prop('checked', value_)
  }

  /** Rend le BVH invisible */
  hide() {
    this.skeleton.visible = false
  }

  /** Rend le BVH visible */
  show() {
    this.skeleton.visible = true
  }

  /** Active ou non le rendu des ombres de l'objet
   *  TODO NON implémenté
   * 
   *  @param {Boolean} value_ 
   */
  enableShadows(value_) {
    //TODO  le rendu de des ombres pour les bvh et les fbx peuvent être activé avec les attribut (dans leur attribut Object3D) castShadow: bool et .receiveShadow: bool
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
    this.clip.setTime(this.timeSlider.valueAsNumber)
    this._updatePlayPauseImg()
  }

  /** Met a jour l'image du bouton playPause
   *  
   *  Met l'image de pause si l'object passe en lecture
   *  Met l'image de lecture si l'object passe en pause
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

  /** TODO : regler le bug du time slider lors d'un clique sur celui-ci
   * 
   *  Si target n'est pas spécifié, incrémente la position du time slider;
   *  Sinon set la position du time slider à la valeur donnée par target
   *  
   * @param {Number} target 
   */
  modifyTimeSlider(target) {
    if (target) {
      this.timeSlider.valueAsNumber = target
      this.clip.setTime(target)
    } else {
      this.timeSlider.valueAsNumber += this.clip.timeScale
    }
  }

  /** Retourne l'uuid du BVH */
  get uuid() {
    return this.skeleton.uuid
  }
}