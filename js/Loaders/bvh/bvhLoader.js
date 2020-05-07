class BVHLoader extends FileLoader {

  /** Contructeur de BVHLoader prenant en parametre la scene du player ainsi que la liste des Animations des BVH
   * 
   *  @param scene scene ou seront joué les BVH
   *  @param bvhAnimationsArray liste des animations des BVH
   */
  constructor(scene, bvhAnimationsArray) {
    super(scene, bvhAnimationsArray)
  }

  /** Charge des fichier BVH et leur associe leur animation correspondante dans le lecteur
   * 
   *  @param filesToLoadEvent : evenement lié au clic sur un bouton de chargeement de fichier
   */
  loadBVH(filesToLoadEvent) {
    return new Promise(async(resolve, reject) => {
      let files = filesToLoadEvent.currentTarget.files;
      this.nbFileToLoad = files.length

      if (this.nbFileToLoad === 0) {
        reject(new Error('No file is selected'))
      } else {
        console.info('Start loading ', this.nbFileToLoad, ' files');
        try {
          await this.loadNewFiles(files)
          resolve()
        } catch (error) {
          reject(error)
        }
      }
    })
  }

  /** Retourne une liste de promesses correspondant à l'ensemble des chargement de fichier BVH entré en paramètre
   * 
   *  @param files la liste des fichiers à charger
   * 
   *  @returns une liste de promesse
   *    - resolue lorsque l'ensemble des promesses de la liste sont resolues
   *    - rejetée lorsqu'une des promesse de la liste est rejeté
   */
  _load(files) {
    let currNbLoadedFile = this.currNbLoadedFile
    return Promise.all([...files].map(async(file, index) => {
      return this._loadBvhfile(file, currNbLoadedFile + index)
    }))
  }

  /** Retourne une promesse qui parse un fichier BVH et l'ajoute à la liste des BVH
   * 
   *  @param event evenement de la methofde onload du FileReader
   *  @param bvhAnimationsIndex index du bvh dans la liste de BVH (this.animations)
   *  @param bvhFileName nom du fichier BVH
   * 
   *  @returns Une promesse :
   *    - resolu lorsque le parsing du fichier et son ajout dans la liste sont fini.
   *    - rejeté lorsque le parser renvoie une erreur
   */
  async _parseBvhFileContent(event, bvhAnimationsIndex, bvhFileName) {
    return new Promise((resolve, reject) => {
      try {
        // Parsing du fichier BVH
        let bvhFile = new BVHParser(event.target.result)

        // nouvelle mesh pour représenter le squelette
        let geometry = new THREE.BufferGeometry();
        let material = new THREE.MeshPhongMaterial({ skinning: true });
        let mesh = new THREE.SkinnedMesh(geometry, material);

        // bind du squelette
        let animation = bvhFile.getAnimation()
        mesh.add(animation.skeleton.bones[0]);
        mesh.bind(animation.skeleton);

        // normalisation de la taille
        let sizeFactor = bvhFile.getSizeFactor()
        mesh.scale.x = sizeFactor
        mesh.scale.y = sizeFactor
        mesh.scale.z = sizeFactor

        // figure finale
        let skeletonHelper = new THREE.SkeletonHelper(mesh);
        skeletonHelper.material.linewidth = 2;

        this.scene.add(skeletonHelper);
        this.scene.add(mesh);

        // permet de gérer les timings d'animations asynchrones entre eux et avec le framerate
        let mixer = new THREE.AnimationMixer(mesh);
        mixer.clipAction(animation.clip).play()

        let bvhFrameTime = bvhFile.getFrameTime()
        let bvhNbFrame = bvhFile.getNbFrames()

        this._addElementToObjectList(skeletonHelper.uuid, bvhFileName, "bvh")

        this.animations.push(new BVHAnimationElement(bvhFileName, skeletonHelper.uuid, skeletonHelper, mixer, bvhFile,))

        this.nbLoadedFiles += 1
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  /** Retourne un promesse chargeant un fichier bvh entré en parametre.
   * 
   *  @param file fichier bvh a chargé
   *  @param bvhAnimationsIndex index du bvh dans la liste de BVH (this.animations
   * 
   *  @returns Une promesse :
   *    - résolu lorsque le fichier est chargé.
   *    - rejeté si la lecture du fichier est interrompu ou échoue
   */
  _loadBvhfile(file, bvhAnimationsIndex) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = async(event) => {
        try {
          await this._parseBvhFileContent(event, bvhAnimationsIndex, file.name)
          resolve()
        } catch (error) {
          reject(new Error(error))
        }
      }
      reader.onabort = (error) => { reject(new Error("FileReader abort : ", error)) }
      reader.onerror = (error) => { reject(new Error("FileReader abort : ", error)) }
      reader.readAsText(file); // Async
    })
  }
}