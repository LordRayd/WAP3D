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
   *  @param {Number} frameTimeReference_ Le frametime de observé du navigateur
   * 
   *  @returns {Boolean} True si au moins un élément de la collection est toujours en lecture, False sinon
   */
  updateAllElementsAnimation(frameTimeReference_) {
    let atLeastOneElementToAnimate = false
    this.forEach(elem => {
      if (elem.timeSlider.valueAsNumber >= elem.timeSlider.max) {
        elem.pauseAnimation()
      } else if (!elem.isPaused) {
        atLeastOneElementToAnimate = true
        elem.clip.timeScale = (elem.speedRatio * frameTimeReference_) / elem.frameTime
        elem.clip.update(elem.frameTime)
        elem.updateTimeSlider() // TODO Régler le problème d'imprécision du slider
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
}