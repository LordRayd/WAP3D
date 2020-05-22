class FBXLoader extends FileLoader {

  /**
   * @param scene La scene associer
   */
  constructor(scene, fbxAnimationsArray) {
    super(scene, fbxAnimationsArray);
  }

  /** TODO */
  loadFBX(filesToLoadEvent) {
    if(event.currentTarget.id == '1FileFbx'){
      return new Promise(async(resolve, reject) => {
        let files = filesToLoadEvent.currentTarget.files;
        this.nbFileToLoad = files.length;

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
    } else {
      return new Promise(async (resolve, reject) => {
        try {
          this.nbFileToLoad = filesToLoadEvent.currentTarget.length;
          this.loadingState = "loading"
          $("#messagePlayer").text("Chargement en cours : " + this.nbFileToLoad + " fichiers.")
          this.oldNbLoadedFiles = this.nbLoadedFiles // sauvegarde du nombre de ficheir déjà chargé
          // Barre de chargement
          this._savePlayerContext()
          $("#control").replaceWith(this.progressBar)
          this._updateProgressBar(0)
          await this.load2Files(filesToLoadEvent.currentTarget[0].files[0], filesToLoadEvent.currentTarget[1].files[0])
          //await this.load2Files('./ressources/fbx/'+filesToLoadEvent.currentTarget[1].files[0].name, './ressources/fbx/'+filesToLoadEvent.currentTarget[0].files[0].name)
          this._restorePlayerContext()
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }
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
      return this.loadFbxFile(file);
    }))
  }

  /** TODO */
  loadFbxFile(fbxFile) {
    return new Promise((resolve, reject) => {
      let loader = new THREE.FBXLoader(this._createManager(fbxFile));

      // loader.load(url, onLoad, onProgress, onError)
      let mixer;
      loader.load(fbxFile.name,
        (loadedFbxObject) => {
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
          this.nbLoadedFiles += 1;
          this._addElementToObjectList(fbxUuid, fbxFile.name, "fbx");
          this.animations.push(new FBXAnimationElement(fbxFile.name, fbxUuid, mixer))
          resolve();
        },
        null,
        error => reject(error));
    });
  }

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

  _loadModel(file_, animationArray_) {
    console.log(file_)
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
          this.nbLoadedFiles += 1;
          this._addElementToObjectList(fbxUuid, file_.name, "fbx");
          this.animations.push(new FBXAnimationElement(fbxUuid, fbxUuid, mixer));
          resolve();
        },
        null,
        error => reject(error));
    });
  }

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