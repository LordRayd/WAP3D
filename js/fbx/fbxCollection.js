/**
 * Array avec des méthodes et attributs en plus dans le but de stocker et d'interagir avec une collection de FBX.
 */
class FBXAnimationArray extends Array {

    /** Retire l'élément de uuid correspondant de la collection
   *  @param {*} uuid_ 
   */
  removeByUUID(uuid_) {
    this.some((fbxAnimationElem, index) => {
      if (fbxAnimationElem.uuid === uuid_) {
        //TODO supprimer l'élément dans la scène
        this.splice(index, 1)
        return true
      }
    })
  }

  /** @param {*} uuid_ Le UUID pour lequel on cherche à trouver un élément correspondant
   *  @returns {FBXAnimationElement} l'élément correspondant au UUID donné si il existe
   */
  getByUUID(uuid_) {
    for (let elem of this) {
      if (elem.uuid === uuid_) {
        return elem
      }
    }
  }

}

/** Objet contenant l'ensembles des données nécéssaires aux traitement d'un BVH.
 *  Utilisé dans BVHAnimationArray
 */
class FBXAnimationElement {

}