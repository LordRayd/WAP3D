/**
 * Simple outil agissant comme un array classique auquels des fonctionnalité utiles au problèmes liées aux BVH ont été greffé.
 */
class BVHAnimationArray extends Array {

  /**
   * Retire l'élément de uuid correspondant de l'objet
   * @param {*} uuid_ 
   */
  removeByUUID(uuid_) {
    return this.some((bvhAnimationElem, index) => {
      if (bvhAnimationElem.uuid === uuid_) {
        //TODO supprimer l'élément dans la scène
        this.splice(index, 1)
        return index
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

  /**TODO */
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
   * @param {*} sliderReference_ le slider générale du lecteur
   * @param {*} frameTimeReference_ le frametime de référence du navigateur
   */
  updateAllElements(sliderReference_, frameTimeReference_) {
    //TODO
    this.forEach(bvhElem => {
      if (bvhElem.isVisible) bvhElem.show()
      else bvhElem.hide()

      if (sliderReference_ < bvhElem.nbFrames && !bvhElem.isPaused) {
        //TODO prise en compte de bvhElem.isVisible
        //TODO prise en compte de la position du slider correspondant à bvhElem
        bvhElem.clip.timeScale = frameTimeReference_ / bvhElem.frameTime
        bvhElem.clip.update(bvhElem.frameTime)
        bvhElem.updateTimeSlider() // TODO à faire marcher correctement
      }
    });
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
    this.name = name_
    this.skeleton = skeleton_
    this.clip = animationMixer_
    this.frameTime = bvhFile_.getFrameTime()
    this.nbFrames = bvhFile_.getNbFrames()
    this.uuidString = String(this.uuid)
    $('#' + this.uuidString + " .time").max = this.nbFrames
    $('#' + this.uuidString + " .time").min = 1
    $('#' + this.uuidString + " .time").valueAsNumber = 1
    this.isVisible = true
  }

  /**
   * @return True si la checkbox de l'élément dans la page est coché, false sinon.
   */
  get isVisible() {
    return $('#' + this.uuidString + " .display").is(":checked")
  }

  /**
   * @param value_ : si true alors la checkbox est coché, inverse sinon
   */
  set isVisible(value_) {
    $('#' + this.uuidString + " .display").prop('checked', value_)
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

  /**  
   * True si le bouton play/pause est reglé sur paus, false sinon
   */
  get isPaused() {
    //TODO
    let img = $('#' + this.uuidString + " .playPause")[0].lastChild.src.split("/").splice(-1)[0]
    if (img === "pause_button.svg") {
      return false
    } else if (img === "play_button.svg") {
      return true
    } else {
      console.error("Unknown play/Pause source")
      return true
    }
  }

  /**
   * Si true, le bouton play/pause sera set sur le logo play
   * Inverse si false
   */
  set isPaused(value_) {
    let target = $('#' + this.uuidString + " .playPause")[0].lastChild
    if (value_) {
      target.src = "./images/play_button.svg"
    } else {
      target.src = "./images/pause_button.svg"
    }
  }

  /**
   * Si target n'est pas spécifié, incrémente la position;
   * Sinon set la position à la valeur donnée par target
   * @param {*} target 
   */
  updateTimeSlider(target) {
    //TODO
    if (target !== undefined) $('#' + this.uuidString + " .time")[0].valueAsNumber = target
    else $('#' + this.uuidString + " .time")[0].valueAsNumber += this.clip.timeScale
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
   * Attention de penser à reset la time bar global si cet élément est le plus long
   */
  restart() {
    this.clip.setTime(0)
  }
}
