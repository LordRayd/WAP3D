/**
 * Simple outil agissant comme un array classique auquels des fonctionnalité utiles au problèmes liées aux BVH ont été greffé.
 */
class BVHAnimationArray extends Array {

  /**
   * Retire l'élément de uuid correspondant de l'objet
   * @param {*} uuid_ 
   */
  removeByUUID(uuid_) {
    this.some((bvhAnimationElem, index) => {
      if (bvhAnimationElem.uuid === uuid_) {
        //TODO supprimer l'élément dans la scène
        this.splice(index, 1)
        return true
      }
    })

    /*
    for (let index in this) {
        if (this[index].getuuid() === uuid_) {
            this.splice(index, 1)
            return index
        }
    }
    */
  }

  /**
   * Retourne l'OBJET ayant le plus grand nombre de frames
   */
  getByMaxNbOfFrames() {
    return this.reduce((bvh0, bvh1) => {
      return bvh0.nbFrames < bvh1.nbFrames ? bvh1 : bvh0
    })
  }

  /**
   * Retourne l'OBJET ayant l'animation la plus longue de la collection
   */
  getByMaxOverallTime() {
    return this.reduce((bvh0, bvh1) => {
      return (bvh0.nbFrames * bvh0.frameTime) < (bvh1.nbFrames * bvh1.frameTime) ? bvh1 : bvh0
    })
  }

  /**
   * renvoie l'élément avec le UUID correspondant
   */
  getByUUID(uuid_) {
    for (let elem of this) {
      if (elem.uuid === uuid_) {
        return elem
      }
    }
  }

  /**TODO À RENOMMER ! ON NE CHANGE PAS DE FRAME TIME MAIS DE FRAME (tout court)*/
  setAllBvhFrameTime(time) {
    this.forEach(bvh => {
      let newTime = bvh.nbFrames > time ? bvh.frameTime * time : bvh.frameTime * bvh.nbFrames
      bvh.clip.setTime(newTime)
    });
  }

  /**
   * Met à jour l'ensemble des bvh chargé dans le lecteur.
   * Prend en compte pour chaque élément si il est mis en pause
   * (TODO) et si il sont visible ou non
   * 
   * @param {*} frameTimeReference_ le frametime de référence du navigateur
   */
  updateAllElementsAnimation(frameTimeReference_) {
    //TODO
    let atLeastOneElementToAnimate = false
    this.forEach(bvhElem => {
      if(bvhElem.timeSlider.valueAsNumber >= bvhElem.nbFrames){
        bvhElem.isPaused = true
        bvhElem._updatePlayPauseImg()
      }

      if (!bvhElem.isPaused) {
        atLeastOneElementToAnimate = true
          //TODO prise en compte de bvhElem.isVisible
          //TODO prise en compte de la position du slider correspondant à bvhElem
        bvhElem.clip.timeScale = (bvhElem.speedRatio * frameTimeReference_) / bvhElem.frameTime
        bvhElem.clip.update(bvhElem.frameTime)
        bvhElem.modifyTimeSlider() // TODO à faire marcher correctement
      }
    });
    return atLeastOneElementToAnimate
  }

  /** TODO */
  updateAllElementsProperties() {
    this.forEach(bvhElem => {
      if (bvhElem.isVisible) bvhElem.show()
      else bvhElem.hide()
    })
  }

  /** TODO */
  contain(objectUuid_) {
    return this.some((bvh_) => {
      return bvh_.uuid == objectUuid_
    })
  }

  /** TODO */
  toggleOneBVHAnimation(objectUuid_) {
    this.getByUUID(objectUuid_).toggleAnimation()
  }

  /** TODO */
  replayOneBVHAnimation(objectUuid_) {
    this.getByUUID(objectUuid_).replayAnimation()
  }

  /** TODO */
  modifyOneBVHFTimeSlider(objectUuid_, newValue) {
    console.log(newValue)
    this.getByUUID(objectUuid_).modifyTimeSlider(newValue)
  }

  /** TODO */
  pauseAllAnimation() {
    this.forEach((bvh) => {
      bvh.pauseAnimation()
    })
  }

  /** TODO */
  playAllAnimation() {
    this.forEach((bvh) => {
      bvh.playAnimation()
    })
  }

  /** TODO */
  resumeAllAnimation() {
    let atLeastOneAnimationToPlay = false
    this.forEach((bvh) => {
      if (bvh.resumeAnimation() == true) {
        atLeastOneAnimationToPlay = true
      }
    })
    return atLeastOneAnimationToPlay
  }

  /** TODO */
  replayAllAnimation(resetResumeAnim = false) {
    this.forEach((bvh) => {
      bvh.replayAnimation(resetResumeAnim)
    })
  }
}


class BVHAnimationElement {
  /**
   * Objet contenant l'ensembles des données nécéssaires aux traitement
   * d'un BVH.
   * Utilisé en tandeme avec l'objet BVHAnimationArray
   * @param {*} name_ 
   * @param {*} skeleton_ 
   * @param {*} animationMixer_ 
   * @param {*} bvhFile_ 
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
    console.log($("#" + this.uuid))
    this.timeSlider = $("#" + this.uuid + " .timeSlider")[0]
    this.timeSlider.max = this.nbFrames
    this.timeSlider.min = 1
    this.timeSlider.valueAsNumber = this.timeSlider.min

    // Affichage a lecran
    this.isVisible = true
  }

  /**
   * @return True si la checkbox de l'élément dans la page est coché, false sinon.
   */
  get isVisible() {
    return $('#' + this.uuid + " .display").is(":checked")
  }

  /**
   * @param value_ : si true alors la checkbox est coché, inverse sinon
   */
  set isVisible(value_) {
    $('#' + this.uuid + " .display").prop('checked', value_)
  }

  /**
   * Désactive le rendu du BVH
   */
  hide() {
    this.skeleton.visible = false
  }

  /**
   * Active le rendu du BVH
   */
  show() {
    this.skeleton.visible = true
  }

  /**
   * Active ou non le rendu des ombres de l'objet
   * @param {*} value_ 
   */
  enableShadows(value_) {
    //TODO  le rendu de des ombres pour les bvh et les fbx peuvent être activé avec les attribut (dans leur attribut Object3D) castShadow: bool et .receiveShadow: bool
  }

  /** TODO */
  toggleAnimation() {
    if (this.isPaused) this.playAnimation()
    else this.pauseAnimation()
    this.resumeAnimationValue = this.isPaused
    this._updatePlayPauseImg()
  }

  /** TODO */
  playAnimation() {
    this.isPaused = false
    this._updatePlayPauseImg()
  }

  /** TODO */
  pauseAnimation() {
    this.isPaused = true
    this._updatePlayPauseImg()
  }

  /** TODO */
  resumeAnimation() {
    this.isPaused = this.resumeAnimationValue
    this._updatePlayPauseImg()
    return !this.isPaused
  }

  /** TODO */
  replayAnimation(resetResumeAnim) {
    if (resetResumeAnim == true) this.resumeAnimationValue = false
    this.timeSlider.valueAsNumber = this.timeSlider.min
    this.clip.setTime(this.timeSlider.valueAsNumber)
    this._updatePlayPauseImg()
  }

  /** TODO */
  _updatePlayPauseImg() {
    let img = $('#' + this.uuid + " .playPause")[0].lastChild
    if (this.isPaused) {
      img.src = "./images/play_button.svg"
    } else {
      img.src = "./images/pause_button.svg"
    }
  }

  /**  
   * @return True si le bouton play/pause est reglé sur paus, false sinon
   */
  get isPaused() {
    return this._isPaused
  }

  /** TODO */
  set isPaused(newValue) {
    if (newValue == false || newValue == true) {
      this._isPaused = newValue
    }
  }

  /**
   * TODO : regler le bug du time slider lors d'un clique sur celui-ci
   * 
   * Si target n'est pas spécifié, incrémente la position;
   * Sinon set la position à la valeur donnée par target
   * @param {*} target 
   */
  modifyTimeSlider(target) {
    if (target){
       this.timeSlider.valueAsNumber = target
       this.clip.setTime(target)
      }
    else this.timeSlider.valueAsNumber += this.clip.timeScale
  }

  /**
   * Renvoie le uuid correspondant à l'objet.
   * Il s'agit en réalité du uuid du skeleton lié à l'objet
   */
  get uuid() {
    return this.skeleton.uuid
  }

  /**
   * Remet l'animation de l'objet à la première frame
   */
  restart() {
    this.clip.setTime(0)
  }
}