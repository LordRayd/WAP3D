/** Objet contenant l'ensembles des données et méthodes nécéssaires aux traitement d'un BVH.
 *  Utilisé par BVHAnimationArray
 */
class BVHAnimationElement extends AnimationElement {
  /**
   *  @param {String} name_ Le nom du BVH
   *  @param {UUID} uuid_ le UUID qui sera associé à l'élément
   *  @param {THREE.SkeletonHelper} skeleton_
   *  @param {THREE.AnimationMixer} animationMixer_ 
   *  @param {BVHParser} bvhFile_ 
   */
  constructor(name_, uuid_, skeleton_, animationMixer_, bvhFile_) {
    super(name_, uuid_, animationMixer_, 0, bvhFile_.getNbFrames())

    this.skeleton = skeleton_
    this.skeleton.receiveShadow = true
    this.skeleton.castShadow = true

    this.frameTime = bvhFile_.getFrameTime()
    this.nbFrames = bvhFile_.getNbFrames()
    this.overallTime = this.clip.nbFrames * this.frameTime

    //prototype JSsur les bones du skeleton pour ajouter des repères sur chaque node
    this.skeleton.bones.forEach(elem => {
      elem.axis = new THREE.AxesHelper(1) //création et initialisation de l'attribut axis
      elem.axis.material.linewidth = 2
      elem.axis.visible = false
      elem.add(elem.axis)
    })
  }

  /** L'opacité de l'élément, compris entre 0 et 1 */
  get opacity() {
    return this.skeleton.material.opacity
  }

  /** L'opacité de l'élément, compris entre 0 et 1
   * 
   *  @param {Number} 
   */
  set opacity(value_) {
    this.skeleton.material.opacity = value_
  }

  /** Rend le BVH invisible */
  hide() {
    this.isVisible = false
    this.skeleton.visible = false
    this._updateVisibilityImg()
  }

  /** Rend le BVH visible */
  show() {
    this.isVisible = true
    this.skeleton.visible = true
    this._updateVisibilityImg()
  }

  /** Si true alors le bvh produit des ombres */
  get shadowEnabled() {
    return this.skeleton.castShadow
  }

  /**
   * @param {Boolean} value_ Si true alors le bvh produit des ombres
   */
  set shadowEnabled(value_) {
    this.skeleton.castShadow = value_
  }
}