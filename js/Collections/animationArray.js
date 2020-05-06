class AnimationArray extends Array {
  /** Retire l'élément de uuid correspondant de la collection
   *  
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

  /** 
   *  @param {*} uuid_ Le UUID pour lequel on cherche à trouver un élément correspondant
   *  
   *  @returns {BVHAnimationElement} l'élément correspondant au UUID donné si il existe
   */
  getByUUID(uuid_) {
    for (let elem of this) {
      if (elem.uuid === uuid_) { return elem }
    }
  }

  /** Retourne si l'object entré en paramaetre est présent o non dans la liste. 
   * 
   *  @param {UUID} objectUuid_ le UUID à rechercher
   * 
   *  @returns {Boolean} True si la collection contient un élément correspondant au UUID donné
   */
  contains(objectUuid_) {
    return this.some((bvh_) => {
      return bvh_.uuid == objectUuid_
    })
  }

  /** Avance l'animation de chacun des éléments de la collection dans le temps s'il ne sont pas en pause.
   * 
   *  @returns {Boolean} True si au moins un élément de la collection est toujours en lecture, False sinon
   */
  updateAllElementsAnimation() {
    let atLeastOneElementToAnimate = false
    this.forEach(elem => {
      if (elem.timeSlider.valueAsNumber >= elem.timeSlider.max) {
        elem.pauseAnimation()
      } else if (!elem.isPaused) {
        atLeastOneElementToAnimate = true
        elem.updateAnimation()
        elem.updateTimeSlider()
      }
    });
    return atLeastOneElementToAnimate
  }

  /** Set la frame entree en parametre comme frame courante pour tous les éléments de la collection.
   *  Si la frame est supérieur à la longueur réel d'un élément alors sa frame courante deviendra sa dernière.
   *  
   *  @param {Number} frame L'index de frame souhaité
   */
  setAllTime(newTimeSliderValue) {
    this.forEach(elt => {
      let newTime = elt.timeSlider.max > newTimeSliderValue ? elt.frameTime * newTimeSliderValue : elt.frameTime * elt.timeSlider.max
      elt.clip.setTime(newTime)
    });
  }

  /** Met en pause lelement entré en parametre s'il est en lecture, le met en lecture sinon.
   * 
   *  @param {UUID} objectUuid_ Le UUID de l'élément de la collection
   */
  toggleOneAnimation(objectUuid_) {
    this.getByUUID(objectUuid_).toggleAnimation()
  }

  /** Replace un élément entré en paramètre à sa première frame.
   * 
   *  @param {UUID} objectUuid_ Le UUID de l'élément de la collection
   */
  replayOneAnimation(objectUuid_) {
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
    this.forEach((elem) => {
      elem.pauseAnimation()
    })
  }

  /**  */
  playAllAnimations() {
    this.forEach((elem) => {
      elem.playAnimation()
    })
  }

  /** 
   *  @returns {Boolean} True si au moins un élément de l'ensemble reprend effectivement son animation, False sinon.
   */
  resumeAllAnimations() {
    let atLeastOneAnimationToPlay = false
    this.forEach((elem) => {
      if (elem.resumeAnimation() == true) {
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
    this.forEach((elem) => {
      elem.replayAnimation(resetResumeAnim)
    })
  }

  /** Méthode abstraite */
  _updateListVisibilityImg(value) { throw new Error("_updateListVisibilityImg Abstract : not Implemented") }

  /** TODO */
  hideAllAnimations() {
    this.forEach(elem => elem.hide())
    this._updateListVisibilityImg(false)
  }

  /** TODO */
  showAllAnimations() {
    this.forEach(elem => elem.show())
    this._updateListVisibilityImg(true)
  }
}