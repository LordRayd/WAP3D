class AnimationElement {
  constructor(name_, uuid_, animationMixer_, timeSliderMin, timeSliderMax) {
    this.name = name_;
    this.uuid = uuid_
    this.clip = animationMixer_;
    this.clock = new THREE.Clock();

    // Vitesse de lecture
    this.speedRatio = 1

    // Etat en pause ou non
    this.isPaused = false;

    // boolean dertiminant si l'animation reprend a sa position ou non après une pause
    this.resumeAnimationValue = this.isPaused;

    // Affichage a lecran
    this.isVisible = true

    // Pause/Play
    this.playPauseButton = $("#" + this.uuid + " .playPause")[0];

    // TODO REGLER PROBLEME DANS BVH POUR POUVOIR DECOMMENTER
    // Affiche l'élément normalement (sans le mode wireframe)
    //this.wireframe = false
    // TODO REGLER PROBLEME DANS BVH POUR POUVOIR DECOMMENTER
    // Rend tous les element totalement opaque
    //this.opacity = 1;

    //Time Slider
    this.timeSlider = $("#" + this.uuid + " .timeSlider")[0];
    this.timeSlider.max = timeSliderMax;
    this.timeSlider.min = timeSliderMin;
    this.timeSlider.valueAsNumber = this.timeSlider.min;
  }

  /** Incrémente la position du time slider si aucun parametre n'est renseigné.
   *  Sinon la valeur du time slider prendre la valeur entrée en paramètre.
   *  
   *  @param {Number} target : Option, noubelle valeur du time slider
   */
  updateTimeSlider(newTime = null) {
    if (newTime) {
      this.timeSlider.valueAsNumber = newTime
      this.clip.setTime(this.timeSlider.valueAsNumber * this.frameTime)
    } else {
      this.timeSlider.valueAsNumber = this.clip.time / this.frameTime
    }
  }

  /**  */
  toggleAnimation() {
    if (this.isPaused) this.playAnimation()
    else this.pauseAnimation()
    this.resumeAnimationValue = this.isPaused
    this._updatePlayPauseImg()
  }

  /** TODO */
  playAnimation() {
    this.isPaused = false;
    this.clock.start();
    this._updatePlayPauseImg()
  }

  /** TODO */
  pauseAnimation() {
    this.isPaused = true;
    this.clock.stop();
    this._updatePlayPauseImg();
  }

  /** Replace le timeSlider du BVH au début et rejoue ou non lanimation en fonction du paramètre
   * 
   *  @param {Boolean} resetResumeAnim True si l'animation se rejoue, False si l'animation reste en pause.
   */
  replayAnimation(resetResumeAnim) {
    if (resetResumeAnim == true) this.resumeAnimationValue = false
    this.timeSlider.valueAsNumber = this.timeSlider.min
    this.clip.setTime(this.timeSlider.min)
    this._updatePlayPauseImg()
  }

  /** TODO */
  resumeAnimation() {
    this.isPaused = this.resumeAnimationValue
    this._updatePlayPauseImg()
    this.clock.start();
    return !this.isPaused
  }

  /** Met a jour l'image du bouton playPause
   *    - Image de pause si l'object passe en lecture
   *    - Image de lecture si l'object passe en pause
   */
  _updatePlayPauseImg() {
    let img = $('#' + this.uuid + " .playPause")[0].children[0]
    if (this.isPaused) {
      img.src = "./images/play_button.svg"
    } else {
      img.src = "./images/pause_button.svg"
    }
  }

  /** Met à jour l'image du bouton de visibilité */
  _updateVisibilityImg() {
    let img = $('#' + this.uuid + " .display")[0].children[0]
    if (this.isVisible) {
      img.src = "./images/eye_button.svg"
    } else {
      img.src = "./images/closed_eye_button.svg"
    }
  }

  /** Retourne si le FBX est en pause ou non */
  get isPaused() {
    return this._isPaused
  }

  /**  */
  set isPaused(newValue) {
    if (typeof newValue === "boolean") { this._isPaused = newValue }
  }

  /** TODO */
  updateAnimation() {
    this.clip.update(this.clock.getDelta() * this.speedRatio);
  }

  /** Methode abstraite */
  hide() { throw new Error("hide() Abstract : not Implemented") }

  /** Methode abstraite */
  show() { throw new Error("show() Abstract : not Implemented") }

  /** Methode abstraite */
  get shadowEnabled() { throw new Error("get shadowEnabled() Abstract : not Implemented") }

  /** Methode abstraite */
  set shadowEnabled(value_) { throw new Error("set shadowEnabled(value_) Abstract : not Implemented") }

  /** Methode abstraite */
  get opacity() { throw new Error("get opacity() Abstract : not Implemented") }

  /** Methode abstraite */
  set opacity(value_) { throw new Error("set opacity(value_) Abstract : not Implemented") }

  /** Methode abstraite */
  get wireframe() { throw new Error("get wireframe() Abstract : not Implemented") }

  /** Methode abstraite 
   * 
   *  @param {Boolean} render : true pour afficher le wireframe, false pour le retirer
   */
  set wireframe(render) { throw new Error("set wireframe(value_) Abstract : not Implemented") }
}