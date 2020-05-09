/** Objet contenant l'ensembles des données nécéssaires aux traitement d'un BVH.
 *  Utilisé dans BVHAnimationArray
 */
class FBXAnimationElement extends AnimationElement {
  /**
   *  @param {*} name_ le nom du FBX
   */
  constructor(name_, uuid_, animationMixer_) {
    super(name_, uuid_, animationMixer_, 0, animationMixer_._root.animations[0].duration);
    this.frameTime = 1;
  }

  /** TODO */
  hide() {
    this.isVisible = false
    this.clip._root.children.forEach(elt => elt.visible = false)
    this._updateVisibilityImg()
  }

  /** TODO */
  show() {
    this.isVisible = true
    this.clip._root.children.forEach(elt => elt.visible = true)
    this._updateVisibilityImg()
  }
}