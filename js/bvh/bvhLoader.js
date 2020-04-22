class BVHLoader {

  /** Contructeur de BVHLoader prenant en parametre la scene du player ainsi que la liste des Animations des BVH
   * 
   * @param scene scene ou seront joué les BVH
   * @param bvhAnimationsArray liste des animations des BVH
   */
  constructor(scene, bvhAnimationsArray) {
    this.loadingState = false
    this.scene = scene
    this.bvhAnimations = bvhAnimationsArray
    this.nbFileToLoad = 0
    this.totalNbLoadedFiles = 0
    this.oldNbLoadedFiles = 0
    this.progressBar = $('<div id="progressBar"></div>')
    this.progressBar.append('<div id="progressValue"></div>')
    this.progressBar.append('<div id="currProgress"></div>')
  }

  /** Charge des fichier BVH et leur associe leur animation correspondante dans le lecteur
   * 
   * @param filesToLoadEvent : evenement lié au clic sur un bouton de chargeement de fichier
   */
  loadBVH(filesToLoadEvent) {
    return new Promise(async (resolve, reject) => {
      let files = filesToLoadEvent.currentTarget.files;
      this.nbFileToLoad = files.length
  
      if (this.nbFileToLoad === 0) {
        throw new Error('No file is selected');
      } else {
        console.info('Start loading ', this.nbFileToLoad, ' files');
        try {
          this.loadingState = "loading"
          $("#messagePlayer").text("Chargement en cours : " + this.nbFileToLoad + " fichiers.")
  
          this.oldNbLoadedFiles = this.nbLoadedFiles // sauvegarde du nombre de ficheir déjà chargé
  
          // Barre de chargement
          this._savePlayerContext()
          $("#control").replaceWith(this.progressBar)
          this._updateProgressBar(0)
  
          await this._readBvhFilesAsText(files, this.oldNbLoadedFiles)
          this._restorePlayerContext()
          resolve()
        } catch (error) {
          reject(error)
        }
      }
    })
  }

  /** Retourne une promesse qui parse un fichier BVH et l'ajoute à la liste des BVH
   * 
   * @param event evenement de la methofde onload du FileReader
   * @param bvhAnimationsIndex index du bvh dans la liste de BVH (this.bvhAnimations
   * @param bvhFileName nom du fichier BVH
   * 
   * @returns Une promesse :
   *  - resolu lorsque le parsing du fichier et son ajout dans la liste sont fini.
   *  - rejeté lorsque le parser renvoie une erreur
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

        this._addBVHToObjectList(skeletonHelper.uuid, bvhFileName, bvhFrameTime, bvhNbFrame, bvhAnimationsIndex)

        this.bvhAnimations.push(new BVHAnimationElement(bvhFileName, skeletonHelper, mixer, bvhFile))

        this.nbLoadedFiles += 1
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  /** Retourne une liste de promesses correspondant a l'ensemble des chargement de fichier BVH entré en paramètre
   * 
   * @param files la liste des fichiers bvh à charger
   * @param currNbLoadedFile nombre courrant de fichier déjà chargé par BVHLoader au moment de l'appel de la méthode
   * 
   * @returns une liste de promesse
   *  - resolue lorsque l'ensemble des promesses de la liste sont resolues
   *  - rejetée lorsqu'une des promesse de la liste est rejeté
   */
  async _readBvhFilesAsText(files, currNbLoadedFile) {
    return Promise.all([...files].map(async(file, index) => {
      return this._loadBvhfile(file, currNbLoadedFile + index)
    }))

  }

  /** Retourne un promesse chargeant un fichier bvh entré en parametre.
   * @param file fichier bvh a chargé
   * @param bvhAnimationsIndex index du bvh dans la liste de BVH (this.bvhAnimations
   * 
   * @returns Une promesse :
   *  - résolu lorsque le fichier est chargé.
   *  - rejeté si la lecture du fichier est interrompu ou échoue
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

  /** Sauvegarde le contexte courrant de la div "control" du player */
  _savePlayerContext() {
    this.controlDiv = $("#control")
  }

  /** Restaure le contexte du player sauvegarder au début du chargment de fichier (voir _savePlayerContext) */
  _restorePlayerContext() {
    $("#progressBar").replaceWith(this.controlDiv)
    this.loadingState = "loaded"
  }

  /** Met a jour l'affichage de la barre de progression a partir du poucentage entre en parametre
   * 
   * @param loadingPercentage nouvelle valeur de progression (en %)
   */
  _updateProgressBar(loadingPercentage) {
    loadingPercentage = parseInt(((this.nbLoadedFiles - this.oldNbLoadedFiles) * 100) / this.nbFileToLoad, 10) + "%"
    $("#currProgress")[0].style.width = loadingPercentage
    $("#progressValue").text(loadingPercentage)
  }

  /** Ajoute une element dans la liste des BVH contenant le nom et l'UUID du BVH a ajouter
   * 
   * @param uuid_ identifiant du bvh a afficher
   * @param name nom du bvh a afficher
   */
  _addBVHToObjectList(uuid_, name) {
    $("#bvhList .list").append('<div id="' + uuid_ + '" class="object"></div>')
    let divToAppendTo = "#bvhList .list #" + uuid_

    $(divToAppendTo).append('<div class="titleArea"><p>' + name + '</p></div>')
    $(divToAppendTo).append('<div class="controlFunctions"></div>')

    let controlDivToAppendTo = "#bvhList .list #" + uuid_ + " .controlFunctions"

    $(controlDivToAppendTo).append('<div   class="playPause"><img src="./images/pause_button.svg"></div>')
    $(controlDivToAppendTo).append('<input class="timeSlider" step="any" type="range">')
    $(controlDivToAppendTo).append('<div   class="replay"> <img src="./images/replay_button.svg"></div>')
    $(controlDivToAppendTo).append('<input class="display" type="checkbox" checked>')
  }

  /** Retourne le nombre total dede fichier (bvh) chargé depuis le debut */
  get nbLoadedFiles() {
    return this.totalNbLoadedFiles
  }

  /**  */
  set nbLoadedFiles(value) {
    this.totalNbLoadedFiles = value
    this._updateProgressBar(value)
    if (console.DEBUG_MODE) {
      console.clear()
      this.bvhAnimations.forEach(console.debug)
    }
  }

  /** Retourne l'état actuel du chargment (false, loading, loaded) */
  get loadingState() {
    return this.bvhFilesloadingState
  }

  /**  */
  set loadingState(state) {
    this.bvhFilesloadingState = state
  }
}