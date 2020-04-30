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
}

/** Objet contenant l'ensembles des données nécéssaires aux traitement d'un BVH.
 *  Utilisé par BVHAnimationArray
 */
class BVHAnimationElement extends AnimationElement {
  /**
   *  @param {*} name_ Le nom du BVH
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

    //prototype sur les bones du skeleton pour ajouter des repères sur chaque node
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
    this.skeleton.visible = false
  }

  /** Rend le BVH visible */
  show() {
    this.skeleton.visible = true
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

/* this.clip.timeScale = (this.speedRatio * frameTimeReference_) / this.frameTime */