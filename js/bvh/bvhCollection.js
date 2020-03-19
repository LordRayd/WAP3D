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
      if (elem.getuuid() === uuid_) {
        return elem
      }
    }
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
  }

  /**
   * Renvoie le uuid correspondant à l'objet.
   * Il s'agit en réalité du uuid du skeleton lié à l'objet
   */
  get uuid() {
    return this.skeleton.uuid
  }
}
