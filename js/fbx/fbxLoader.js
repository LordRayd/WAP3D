class FbxLoader {

  /**
   * @param scene La scene associer
   */
  constructor(scene, fbxAnimationsArray) {
    this.scene = scene;
    this.loadingState = false;
    this.fbxAnimationsArray = fbxAnimationsArray;
  }

  /** TODO */
  loadFBX(filesToLoadEvent) {
    return new Promise(async(resolve, reject) => {
      let files = filesToLoadEvent.currentTarget.files;
      try {
        await this._readFBXFiles(files)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  /** TODO */
  _readFBXFiles(files) {
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
          resolve()
        },
        null,
        error => reject(error))
    })
  }
}