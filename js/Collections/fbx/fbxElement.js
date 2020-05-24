/** Objet contenant l'ensembles des données et méthodes nécéssaires aux traitement d'un FBX.
 *  Utilisé dans FBXAnimationArray
 */
class FBXAnimationElement extends AnimationElement {
  /**
   *  @param {String} name_ le nom du FBX
   *  @param {UUID} uuid_ le UUID qui sera associé à l'élément
   *  @param {THREE.AnimationMixer} animationMixer_
   *  @param {THREE.SkeletonHelper} skeletonHelper_
   */
  constructor(name_, uuid_, animationMixer_, skeletonHelper_) {
    super(name_, uuid_, animationMixer_, 0, animationMixer_._root.animations[0].duration);

    this.overallTime = this.clip._root.animations[0].duration

    // rend le FBX transparent afin de pouvoir changer son opacité
    this.clip._root.children.forEach(elt => {
      if (elt.material) elt.material.transparent = true
    })

    this.frameTime = 1;

    this.skeleton = skeletonHelper_
    this._initialiseAxesHelpers()
  }

  /** Initialise et associe des axes orthornormés sur chaques articulations du modèle*/
  _initialiseAxesHelpers() {
    this.clip._root.children[0].traverse((obj) => {
      obj.axis = new THREE.AxesHelper(5) //création et initialisation de l'attribut axis
      obj.axis.material.linewidth = 2
      obj.axis.visible = false
    })
    //appels séparés afin d'éviter de dépasser la limite de récursivité imposé par certains navigateurs
    this.clip._root.children[0].traverse((obj) => {
      if (obj.type == "Bone") obj.add(obj.axis)
    })
  }

  /** Rend le FBX invisible */
  hide() {
    this.isVisible = false
    this.skeleton.visible = false
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

  /** @param {Boolean} value_ Si true alors le fbx produit des ombres */
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
    if (!this.skeletonHelper) {
      this.clip._root.children.forEach(elt => {
        if (elt.material) elt.material.opacity = value_
      })
    } else {
      this.skeleton.material.opacity = value_
    }
    this._opacity = value_
  }

  /** true si le mode wireframe est activé, false sinon*/
  get wireframe() {
    return this._wireframe
  }

  /** @param {Boolean} render : true pour afficher le wireframe, false pour le retirer*/
  set wireframe(render) {
    this.skeletonHelper = false
    this.clip._root.children.forEach(elt => {
      if (elt.material) elt.material.wireframe = render
    })
    this._wireframe = render
  }

  /** si true le mode SkeletonHelper ou Node est activé */
  get skeletonHelper() {
    return this.skeleton.visible
  }

  /** @param {Boolean} render : true pour afficher uniquement le SkeletonHelper, false pour revenir en normal */
  set skeletonHelper(render) {
    this.skeleton.visible = render
    this.clip._root.children.forEach(elt => {
      if (elt.material) elt.material.opacity = render ? 0 : 1
    })
  }
}