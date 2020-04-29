class FBXLoader extends FileLoader {

  /**
   * @param scene La scene associer
   */
  constructor(scene, fbxAnimationsArray) {
    super(scene, fbxAnimationsArray);
  }

  /** TODO */
  loadFBX(filesToLoadEvent) {
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
      return this.loadFbxModel(file);
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
          this.scene.add(loadedFbxObject);
          this.nbLoadedFiles += 1;
          this._addFBXToObjectList(loadedFbxObject.uuid, fbxFile.name);
          this.animations.push(new FBXAnimationElement(fbxFile.name, fbxFile, mixer))
          resolve();
        },
        null,
        error => reject(error));
    });
  }

  /** Ajoute une element dans la liste des BVH contenant le nom et l'UUID du BVH a ajouter
   * 
   * @param uuid_ identifiant du bvh a afficher
   * @param name nom du bvh a afficher
   */
  _addFBXToObjectList(uuid_, name) {
    $("#fbxList .list").append('<div id="' + uuid_ + '" class="object"></div>')
    let divToAppendTo = "#fbxList .list #" + uuid_

    $(divToAppendTo).append('<div class="titleArea"><p>' + name + '</p></div>')
    $(divToAppendTo).append('<div class="controlFunctions"></div>')

    let controlDivToAppendTo = "#fbxList .list #" + uuid_ + " .controlFunctions"

    $(controlDivToAppendTo).append('<div   class="playPause"><img src="./images/pause_button.svg"></div>')
    $(controlDivToAppendTo).append('<input class="timeSlider" step="any" type="range">')
    $(controlDivToAppendTo).append('<div   class="replay"> <img src="./images/replay_button.svg"></div>')
    $(controlDivToAppendTo).append('<input class="display" type="checkbox" checked>')
  }
}