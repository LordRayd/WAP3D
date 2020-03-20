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
  setAllBvhFrameTime(time){
    this.forEach(bvh => {
      let newTime = bvh.nbFrames > time ? bvh.frameTime * time : bvh.frameTime * bvh.nbFrames
      bvh.clip.setTime(newTime)
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
    $('#'+String(this.uuid)+" .time").max = this.nbFrames
    $('#'+String(this.uuid)+" .time").min = 1
    $('#'+String(this.uuid)+" .time").valueAsNumber = 1
  }

  /**
   * Renvoie le uuid correspondant à l'objet.
   * Il s'agit en réalité du uuid du skeleton lié à l'objet
   */
  get uuid() {
    return this.skeleton.uuid
  }

  /**
   * True si la checkbox de l'élément dans la page est coché, false sinon.
   */
  get isChecked(){
    return $('#'+String(this.uuid)+" .display").is(":checked")
  }

  /**
   * True si le bouton play/pause est reglé sur paus, false sinon
   */
  get isPaused(){
    //TODO
    let img = $('#'+String(this.uuid)+" .playPause")[0].lastChild.src.split("/").splice(-1)[0]
    if(img === "pause_button.svg"){
      return false
    }else if(img === "play_button.svg"){
      return true
    }else{
      console.error("Unknown play/Pause source")
      return true
    }
  }

  /**
   * Remet l'animation de l'objet à la première frame
   * Attention de penser à reset la time bar global si cet élément est le plus long
   */
  restart(){
    this.clip.setTime(0)
  }

  /**
   * Si target n'est pas spécifié, incrémente la position;
   * Sinon set la position à la valeur donnée par target
   * @param {*} target 
   */
  updateTimeSlider(target){
    //TODO
    if(target !== undefined) $('#'+String(this.uuid)+" .time")[0].valueAsNumber = target
    else $('#'+String(this.uuid)+" .time")[0].valueAsNumber += this.clip.timeScale
  }

}
