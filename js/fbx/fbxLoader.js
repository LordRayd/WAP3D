class FBXLoader extends FileLoader {

  /**
   * @param scene La scene associer
   */
  constructor(scene, fbxAnimationsArray) {
    super(scene, fbxAnimationsArray)
  }

  /** TODO */
  loadFBX(filesToLoadEvent) {
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
   * @param files la liste des fichiers à charger
   * 
   * @returns une liste de promesse
   *  - resolue lorsque l'ensemble des promesses de la liste sont resolues
   *  - rejetée lorsqu'une des promesse de la liste est rejeté
   */
  _load(files) {
    return Promise.all([...files].map((file) => {
      return this.loadFbxModel(file)
    }))
  }

  /** TODO */
  loadFbxModel(fbxFile) {
    return new Promise((resolve, reject) => {
      var extraFiles = [];
      extraFiles[fbxFile.name] = fbxFile;
      const manager = new THREE.LoadingManager();

      manager.setURLModifier(function(url, path) {
        return URL.createObjectURL(extraFiles[url.lastOf('/')]);
      });

      let loader = new THREE.FBXLoader(manager);

      // loader.load(url, onLoad, onProgress, onError)
      loader.load(fbxFile.name,
        (loadedFbxObject) => {
          loadedFbxObject.traverse(function(child) {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          this.scene.add(loadedFbxObject);
          this.nbLoadedFiles += 1
          resolve()
        },
        null,
        error => reject(error))
    })
  }
}