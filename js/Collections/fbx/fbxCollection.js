/** Array avec des méthodes et attributs en plus dans le but de stocker et d'interagir avec une collection de FBX. */
class FBXAnimationArray extends AnimationArray {

  /** met à jour l'image du bouton de visibilité de la liste FBX */
  _updateListVisibilityImg(value) {
    let img = $("#fbxList .listDisplay")[0].children[0]
    if (value) {
      img.src = "./images/eye_button.svg"
    } else {
      img.src = "./images/closed_eye_button.svg"
    }
  }
}