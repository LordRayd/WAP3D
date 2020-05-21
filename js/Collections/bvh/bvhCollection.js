/** Array avec des méthodes et attributs en plus dans le but de stocker et d'interagir avec une collection de BVH. */
class BVHAnimationArray extends AnimationArray {
  /** 
   * @returns {AnimationElement} l'OBJET ayant le plus grand nombre de frames dans la collection 
   */
  getByMaxNbOfFrames() {
    return this.reduce((elt0, elt1) => {
      return elt0.nbFrames > elt1.nbFrames ? elt0 : elt1
    })
  }

  /** met à jour l'image du bouton de visibilité de la liste BVH */
  _updateListVisibilityImg(value) {
    let img = $("#bvhList .listDisplay")[0].children[0]
    if (value) {
      img.src = "./images/eye_button.svg"
    } else {
      img.src = "./images/closed_eye_button.svg"
    }
  }
}