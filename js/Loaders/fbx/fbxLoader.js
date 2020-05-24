class FBXLoader extends FileLoader {

  /**
   * @param scene La scene associer
   * @param {array} fbxAnimationsArray Le tableau contenant les éléments fbx chargés
   */
  constructor(scene, fbxAnimationsArray) {
    super(scene, fbxAnimationsArray);
  }

  /** Charge des fichier FBX
   *
   *  @param filesToLoadEvent : evenement lié au clic sur un bouton de chargement de fichier
   *
   *  @returns Une promesse
   *  - resolue lorsque l'ensemble des fichiers ont été bien chargés
   *  - rejetée lorsqu'un fichier n'a pas été correctement chargé
   */
  loadFBX(filesToLoadEvent) {
    return new Promise(async(resolve, reject) => {
      let files = undefined;

      if(event.currentTarget.id == '1FileFbx'){
        files = filesToLoadEvent.currentTarget.files;
        this.nbFileToLoad = files.length;
      } else {
        files = [0, filesToLoadEvent.currentTarget[0].files[0], filesToLoadEvent.currentTarget[1].files[0]];
        this.nbFileToLoad = 2;
      }

      if (this.nbFileToLoad === 0) {
        reject(new Error('No file is selected'));
      } else {
        console.info('Start loading ', this.nbFileToLoad, ' files');
        try {
          await this.loadNewFiles(files);
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    })
  }

  /** Retourne une liste de promesses correspondant à l'ensemble des chargement de fichier FBX entré en paramètre
   * 
   * @param files la liste des fichiers à charger
   * 
   * @returns une liste de promesse
   *  - resolue lorsque l'ensemble des promesses de la liste sont resolues
   *  - rejetée lorsqu'une des promesse de la liste est rejeté
   *  ou une seul promesse
   */
  _load(files) {
    if(files[0] != 0){
      return Promise.all([...files].map((file) => {
        return this._loadModel(file);
      }))
    } else {
      return this.load2Files(files[1], files[2]);
    }
  }

  /** Charge un objet à partir de 2 Fichiers Fbx
   * Charge le fichier de l'animation
   * 
   * @param {file} modelFile Le fichier contenant le modèle
   * @param {file} animationFile Le fichier contenant l'animation
   * 
   * @returns une promesse
   *  - resolue si le chargement s'est bien déroulé
   *  - rejetée si le chargement à rencontrer un problème
   */
  load2Files(modelFile, animationFile) {
    return new Promise((resolve, reject) => {
      //let loader = new THREE.FBXLoader();
      let loader = new THREE.FBXLoader(this._createManager(animationFile));
      loader.load(animationFile.name,
        (loadedFbxObject) => {
          this._loadModel(modelFile, loadedFbxObject.animations).then(resolve);
          this.nbLoadedFiles += 1;
        },
        null,
        error => reject(error));
    });
  }

  /** Charge le model et change son animation par celle donné en paramètre
   *
   * @param {file} file_ Le fichier contenant le modèle
   * @param {AnimationArray} animationArray_ Les animations à changé ou undefined si le fichier contient deja l'animation
   *
   * @returns une promesse
   *  - resolue si le chargement du modèle s'est bien déroulé
   *  - rejetée si le chargement du modèle rencontrer un problème
   */
  _loadModel(file_, animationArray_) {
    return new Promise((resolve, reject) => {
      //let loader = new THREE.FBXLoader();
      let loader = new THREE.FBXLoader(this._createManager(file_));
      let mixer;
      loader.load(file_.name,
        (loadedFbxObject) => {
          if(animationArray_ !== undefined){
            loadedFbxObject.animations = animationArray_;
          }
          mixer = new THREE.AnimationMixer(loadedFbxObject);
          mixer.clipAction(loadedFbxObject.animations[0]).play();
          loadedFbxObject.traverse(function(child) {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          loadedFbxObject.name = loadedFbxObject.uuid;
          let fbxUuid = loadedFbxObject.uuid
          this.scene.add(loadedFbxObject);

          let skeletonHelper = new THREE.SkeletonHelper(loadedFbxObject);
          skeletonHelper.material.linewidth = 2;
          skeletonHelper.visible = false
          this.scene.add(skeletonHelper);

          this.nbLoadedFiles += 1;
          this._addElementToObjectList(fbxUuid, file_.name, "fbx");
          this.animations.push(new FBXAnimationElement(fbxUuid, fbxUuid, mixer, skeletonHelper));
          resolve();
        },
        null,
        error => reject(error));
    });
  }

  /** Renvoie un LoadingManager qui gère la lecture de fichier par le Loader
   * 
   * @param {*} fbxFile Le fichier dont le manager doit permettre le chargement
   * 
   * @returns Le Manager à donner au Loader
   */
  _createManager(fbxFile){
    var extraFiles = [];
      extraFiles[fbxFile.name] = fbxFile;
      const manager = new THREE.LoadingManager();

      manager.setURLModifier(function(url, path) {
        return URL.createObjectURL(extraFiles[url.lastOf('/')]);
      });
    return manager;
  }
}