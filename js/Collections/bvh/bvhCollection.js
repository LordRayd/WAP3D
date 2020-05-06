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

  /** Highlight la collection d'élément donné, si aucune collection n'est fourni ou si elle est vide alors tout les éléments de la scène reprennent leur opacité normale
   *  
   *  @param {Set|Array|null} Uuids_ La collection d'éléments à highlight dans la scène, peut être laissé vide
   */
  highlightElements(Uuids_) {
    let amount = 0
    if (Uuids_) {
      if (Uuids_.constructor.name === "Set") {
        amount = Uuids_.size
      } else {
        amount = Uuids_.length
      }
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

  /** met à jour l'image du bouton de visibilité de la liste BVH */
  _updateListVisibilityImg(value){
    let img = $("#bvhList .listDisplay")[0].children[0]
    if(value){
      img.src = "./images/eye_button.svg"
    }else{
      img.src = "./images/closed_eye_button.svg"
    }
  }
}