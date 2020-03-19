class BVHLoader {

  /** TODO */
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

  /**
   * Charge les fichier bvh entre en parametre et leur associe leur animation correspondante dans le lecteur
   * 
   * @param filesToLoad
   * @param callBack : fonction appele a la fin du chargement du/des fichier(s)
   */
  async loadBVH(filesToLoad, callBack) {
    let files = filesToLoad.currentTarget.files;
    this.nbFileToLoad = files.length

    if (this.nbFileToLoad === 0) {
      console.info('No file is selected');
    } else {
      console.info('Start loading ', this.nbFileToLoad, ' files');

      this.loadingState = "loading"
      $("#messagePlayer").text("Chargement en cours : " + this.nbFileToLoad + " fichiers.")

      this.oldNbLoadedFiles = this.nbLoadedFiles // sauvegarde du nombre de ficheir déjà chargé

      // Barre de chargement
      let controlDiv = $("#control") // sauvegarde de la div "control" dans son état actuel  
      $("#control").replaceWith(this.progressBar)
      this._updateProgressBar(0)

      await this._readBvhFilesAsText(files, this.oldNbLoadedFiles)
      this._restorePlayerContext(controlDiv)
      callBack()
    }
  }

  /** TODO */
  async _parseBvhFileContent(event, bvhAnimationsIndex) {
    return new Promise((resolve, reject) => {
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

      let currBVHInAnimationArray = this.bvhAnimations[bvhAnimationsIndex]
      let bvhFrameTime = bvhFile.getFrameTime()
      let bvhNbFrame = bvhFile.getNbFrames()

      this.bvhAnimations[bvhAnimationsIndex] = new BVHAnimationElement(currBVHInAnimationArray.name, skeletonHelper, mixer, bvhFile)
        // currBVHInAnimationArray.push(skeletonHelper, mixer, bvhFrameTime, bvhNbFrame)

      this._addBVHToObjectList(skeletonHelper.uuid, currBVHInAnimationArray.name, bvhFrameTime, bvhNbFrame, bvhAnimationsIndex)
        // this._addBVHToObjectList(skeletonHelper.uuid, currBVHInAnimationArray[0], bvhFrameTime, bvhNbFrame, bvhAnimationsIndex)

      this.nbLoadedFiles += 1
      resolve()
    })
  }

  /** TODO */
  async _readBvhFilesAsText(files, currNbLoadedFile) {
    return Promise.all([...files].map(async(file, index) => {
      return this._loadBvhfile(file, currNbLoadedFile + index)
    }))

  }

  /** TODO gestion error/abort ?*/
  _loadBvhfile(file, bvhAnimationsIndex) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = async(event) => { resolve(await this._parseBvhFileContent(event, bvhAnimationsIndex)) }
      this.bvhAnimations.push({ name: file.name })
        // bvhAnimationsArray.push([file.name])
      reader.readAsText(file); // Async
    })
  }

  /** TODO */
  _restorePlayerContext(oldDiv) {
    $("#progressBar").replaceWith(oldDiv)
    this.loadingState = "loaded"
  }

  /** TODO */
  _updateProgressBar(loadingPercentage) {
    loadingPercentage = parseInt(((this.nbLoadedFiles - this.oldNbLoadedFiles) * 100) / this.nbFileToLoad, 10) + "%"
    $("#currProgress")[0].style.width = loadingPercentage
    $("#progressValue").text(loadingPercentage)
  }

  /**
   * TODO
   * initialisation par UUID 
   * pour permettre de supprimer des éléments du tab sans perte d'ordre ?
   */
  _addBVHToObjectList(uuid_, name, frameTime, nbFrames, indexInDiv) {
    /*
    '<div id="' + uuid_ + '" class="object">
        <div>
            <img src="./images/pause_button.svg">
        </div>
        <input class="time" classstep="any" type="range">
        <div>
            <img src="./images/replay_button.svg">
        </div>
        <input class="display" type="checkbox">
    </div>'
    */
    $("#bvhList .list").append('<div id="' + uuid_ + '" class="object"><div><img src="./images/pause_button.svg"></div><input class="time" classstep="any" type="range"><div><img src="./images/replay_button.svg"></div><input class="display" type="checkbox"></div>')
  }

  /** TODO */
  get nbLoadedFiles() {
    return this.totalNbLoadedFiles
  }

  /** TODO */
  set nbLoadedFiles(value) {
    this.totalNbLoadedFiles = value
    this._updateProgressBar(value)
    if (console.DEBUG_MODE) {
      console.clear()
      this.bvhAnimations.forEach(console.debug)
    }
  }

  /** TODO */
  get loadingState() {
    return this.bvhFilesloadingState
  }

  /** TODO */
  set loadingState(state) {
    this.bvhFilesloadingState = state
  }
}