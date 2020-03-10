class BVHLoader {

  /** TODO */
  constructor(scene, bvhAnimationsArray) {
    this.bvhFilesloadingState = false
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
   * Sélectionne, associe et lance un bvh dans le lecteur
   */
  associateBVH(filesToLoad) {
    let files = filesToLoad.currentTarget.files; // Le this désigne le contexte courant !
    this.nbFileToLoad = files.length

    if (this.nbFileToLoad === 0) {
      console.info('No file is selected');
    } else {
      console.info('Start loading ', this.nbFileToLoad, ' files');

      this.bvhFilesloadingState = "loading"
      $("#messagePlayer").text("Chargement en cours : " + this.nbFileToLoad + " fichiers.")

      this.controlDiv = $("#control") // sauvegarde de la div dans son état actuel

      this.oldNbLoadedFiles = this.nbLoadedFiles
      this._readBvhFilesAsText(files, this.oldNbLoadedFiles)
    }
  }

  /** TODO */
  _parseBvhFileContent(event, bvhAnimationsIndex) {
    let bvhFile = new BVHParser(event.target.result)
    let animation = bvhFile.getAnimation()

    // nouvelle mesh pour représenter le squelette
    let geometry = new THREE.BufferGeometry();
    let material = new THREE.MeshPhongMaterial({ skinning: true });
    let mesh = new THREE.SkinnedMesh(geometry, material);

    // bind du squelette
    mesh.add(animation.skeleton.bones[0]);
    mesh.bind(animation.skeleton);

    // normalisation de la tialle
    let sizeFactor = bvhFile.getSizeFactor()
    mesh.scale.x = sizeFactor
    mesh.scale.y = sizeFactor
    mesh.scale.z = sizeFactor

    // figure finale
    let skeletonHelper = new THREE.SkeletonHelper(mesh);
    skeletonHelper.material.linewidth = 2;

    scene.add(skeletonHelper);
    scene.add(mesh);

    // permet de gérer les timings d'animations asynchrones entre eux et avec le framerate
    let mixer = new THREE.AnimationMixer(mesh);
    mixer.clipAction(animation.clip).play()

    bvhAnimationsArray[bvhAnimationsIndex].push(skeletonHelper, mixer, bvhFile.getFrameTime(), bvhFile.getNbFrames())
    this._addBVHToObjectList(skeletonHelper.uuid, bvhAnimationsArray[this.nbLoadedFiles][0], bvhFile.getFrameTime(), bvhFile.getNbFrames())

    this.nbLoadedFiles += 1
  }

  /** TODO */
  _readBvhFilesAsText(files, currNbLoadedFile) {
    let offsetFileIndex = this.nbLoadedFiles
    try {
      // Barre de chargement
      $("#control").replaceWith(this.progressBar)
      this._updateProgressBar(currNbLoadedFile, 0)

      let index = 0
      for (const file of files) {
        console.debug('Loading file : ', index);
        this._loadBvhfile(file, offsetFileIndex + index);
        index += 1
      }
    } catch (error) {
      console.error("error", error)
    }
  }

  /** TODO */
  _loadBvhfile(file, bvhAnimationsIndex) {
    let reader = new FileReader();
    reader.onload = event => {
      this._parseBvhFileContent(event, bvhAnimationsIndex)
    }
    bvhAnimationsArray.push([file.name])
    reader.readAsText(file); // Async
  }

  /** TODO */
  _restorePlayerContext() {
    $("#progressBar").replaceWith(this.controlDiv)
    this.bvhFilesloadingState = "loaded"
  }

  /** TODO */
  _updateProgressBar(currNbLoadedFile, loadingPercentage) {
    loadingPercentage = parseInt(((this.nbLoadedFiles - currNbLoadedFile) * 100) / this.nbFileToLoad, 10) + "%"
    $("#currProgress")[0].style.width = loadingPercentage
    $("#progressValue").text(loadingPercentage)
  }

  /**
   * TODO
   * initialisation par UUID 
   * pour permettre de supprimer des éléments du tab sans perte d'ordre ?
   */
  _addBVHToObjectList(uuid_, name, frameTime, nbFrames) {
    $("#bvhList").append('<div id="' + uuid_ + '"class="object">' + name + '\t' + nbFrames + '</div>')
  }

  /** TODO */
  get nbLoadedFiles() {
    return this.totalNbLoadedFiles
  }

  /** TODO #listenerOnChange */
  set nbLoadedFiles(value) {
    this.totalNbLoadedFiles = value
    this._updateProgressBar(this.oldNbLoadedFiles, value)
    if (value === (this.nbFileToLoad - this.oldNbLoadedFiles)) {
      this._restorePlayerContext(this.controlDiv, this.oldNbLoadedFiles)
      fileLoadedCallBack()
    }
  }

  /** TODO */
  get loadingState() {
    return this.bvhFilesloadingState
  }

}