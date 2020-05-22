/** Objet contenant l'ensembles des données nécéssaires aux traitement d'un BVH.
 *  Utilisé dans BVHAnimationArray
 */
class FBXAnimationElement extends AnimationElement {
  /**
   *  @param {*} name_ le nom du FBX
   */
  constructor(name_, uuid_, animationMixer_) {
    super(name_, uuid_, animationMixer_, 0, animationMixer_._root.animations[0].duration);

    this.overallTime = this.clip._root.animations[0].duration

    // rend le FBX transparent afin de pouvoir changer son opacité
    this.clip._root.children.forEach(elt => {
      if (elt.material) console.log(elt.material.transparent = true)
    })

    this.frameTime = 1;

    this._initialiseAxesHelpers()
  }

  /** Initialise les axes orthornormé sur chaques articulations du modèle à l'aide du prototypage javascript
   * ne marche pas en raison de la limite de récursion
  */
  _initialiseAxesHelpers() {
    /*let recursiveNavigation = (object) => {
      object.children.forEach((obj) => {
        obj.axis = new THREE.AxesHelper(20) //création et initialisation de l'attribut axis
        obj.axis.material.linewidth = 2
        obj.axis.visible = false
        obj.add(obj.axis)
        recursiveNavigation(obj)
      })
    }
    recursiveNavigation(this.clip._root.children[0])*/

    function recursiveNavigation(object) {
      let childs = object.children.flatMap(obj => recursiveNavigation(obj))
      if (childs) return childs.concat(object)
      else return [object]
    }
    let boneArray = recursiveNavigation(this.clip._root.children[0])
    boneArray.forEach(obj => {
      obj.axis = new THREE.AxesHelper(20) //création et initialisation de l'attribut axis
      obj.axis.material.linewidth = 2
      obj.axis.visible = false
      obj.add(obj.axis)
    })
    console.log(boneArray)
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
      if (elt.material) elt.material.opacity = value_
    })
    this._opacity = value_
  }

  /** Methode abstraite */
  get wireframe() {
    return this._wireframe
  }

  /** Methode abstraite 
   * 
   *  @param {Boolean} render : true pour afficher le wireframe, false pour le retirer
   */
  set wireframe(render) {
    this.clip._root.children.forEach(elt => {
      if (elt.material) elt.material.wireframe = render
    })
    this._wireframe = render
  }
}