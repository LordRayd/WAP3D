class FileLoader {
  constructor(scene, animationsArray) {
    this.loadingState = false
    this.scene = scene
    this.animations = animationsArray
    this.nbFileToLoad = 0
    this.totalNbLoadedFiles = 0
    this.oldNbLoadedFiles = 0
    this.progressBar = $('<div id="progressBar"></div>')
    this.progressBar.append('<div id="progressValue"></div>')
    this.progressBar.append('<div id="currProgress"></div>')
  }

  /** Charge les nouveaux fichiers
   * 
   * @param {files} files Les fichiers à charger
   * 
   * @returns une promesse
   *    - resolue lorsque les fichiers ont bien été chargé
   *    - rejetée lorsqu'un fichier à eu une erreur de chargement
   */
  loadNewFiles(files) {
    return new Promise(async (resolve, reject) => {
      try {
        this.loadingState = "loading"
        $("#messagePlayer").text("Chargement en cours : " + this.nbFileToLoad + " fichiers.")

        this.oldNbLoadedFiles = this.nbLoadedFiles // sauvegarde du nombre de ficheir déjà chargé

        // Barre de chargement
        this._savePlayerContext()
        $("#control").replaceWith(this.progressBar)
        this._updateProgressBar(0)

        await this._load(files)

        this._restorePlayerContext()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  /** Fonction Abstraite (Promesse)
   *  Retourne une liste de promesses correspondant à l'ensemble des chargements de fichiers entrés en paramètre
   * 
   *  @param files la liste des fichiers à charger
   * 
   *  @returns une liste de promesse
   *    - resolue lorsque l'ensemble des promesses de la liste sont resolues
   *    - rejetée lorsqu'une des promesse de la liste est rejeté
   */
  _load(files) { /** Abstrait */
    return new Promise((resolve, reject) => reject(new Error("this.load Abstract : not Implemented")))
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

  /** Ajoute un element dans la liste des "fbx" ou "bvh" contenant le nom et l'UUID de l'élément a ajouter
   * 
   * @param uuid_ identifiant de l'élément a afficher
   * @param name nom de l'élément a afficher
   * @param {String} type Type de l'élément et par concéquent liste cible où il doit être ajouté; Donc "fbx" ou "bvh"
   */
  _addElementToObjectList(uuid_, name, type) {
    let listElement = $('\
      <div id="'+uuid_+'" class="object">\
        <div class="titleArea">\
          <p>'+name+'</p>\
        </div>\
        <div class="controlFunctions">\
          <div class="playPause"> <img src="./images/pause_button.svg"></img> </div>\
          <input class="timeSlider" step="any" type="range"></input>\
          <div class="replay"> <img src="./images/replay_button.svg"></img> </div>\
          <div class="display"> <img src="./images/eye_button.svg"></img> </div>\
        </div>\
      </div>\
    ')
    $("#"+type+"List .list").append(listElement)
  }

  /** Retourne le nombre total de fichier chargé depuis le debut 
   *
   * @return Le nombre total de fichier chargé
   */
  get nbLoadedFiles() {
    return this.totalNbLoadedFiles
  }

  /** Changement du nombre total de fichier chargé depuis le début 
   *
   * @param {number} value Le nouveau nombre de fichier chargé
   */
  set nbLoadedFiles(value) {
    this.totalNbLoadedFiles = value
    this._updateProgressBar(value)
    if (console.DEBUG_MODE) {
      console.clear()
      this.bvhAnimations.forEach(console.debug)
    }
  }

  /** Retourne l'état actuel du chargement
   * 
   * @returns (false, loading, loaded) 
   */
  get loadingState() {
    return this.bvhFilesloadingState
  }

  /** Change l'état actuel du chargement 
   *
   * @param {string} state (false, loading, loaded) 
   */
  set loadingState(state) {
    this.bvhFilesloadingState = state
  }
}