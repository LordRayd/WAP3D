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
    this._opacity = 1.0;
  }

  /** Rend le FBX invisible */
  hide() {
    this.isVisible = false
    this.clip._root.children.forEach(elt => elt.visible = false)
    this._updateVisibilityImg()
  }

  /** Rend le FBX visible */
  show() {
    this.isVisible = true
    this.clip._root.children.forEach(elt => elt.visible = true)
    this._updateVisibilityImg()
  }

  /** Si true alors le fbx produit des ombres */
  get shadowEnabled() {
    let shadow = false
    this.clip._root.children.forEach(elt => shadow = elt.castShadow)
    return shadow
  }

  /**
    * @param {Boolean} value_ Si true alors le fbx produit des ombres
    */
  set shadowEnabled(value_) {
    this.clip._root.children.forEach(elt => elt.castShadow = value_)
  }

  /** L'opacité de l'élément, compris entre 0 et 1 */
  get opacity() { 
    return this._opacity
  }

  /** L'opacité de l'élément, compris entre 0 et 1
   * 
   *  @param {Number} 
   */
  set opacity(value_) {
    this.clip._root.children.forEach(elt => {
      if(elt.material) console.log(elt.material.opacity = value_)
    })
    this._opacity = value_
  }
}