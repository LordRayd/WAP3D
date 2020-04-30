/**
 * Array avec des méthodes et attributs en plus dans le but de stocker et d'interagir avec une collection de FBX.
 */
class FBXAnimationArray extends AnimationArray {
  /** Mets en pause tous les fbx  */
  pauseAllAnimations() {
    this.forEach((fbx) => {
      fbx.pauseAnimation()
    })
  }

  /** Joue tous les fbx */
  playAllAnimations() {
    this.forEach((bvh) => {
      bvh.playAnimation()
    })
  }

  /** 
   *  @returns {Boolean} True si au moins un élément de l'ensemble reprend effectivement son animation, False sinon.
   */
  resumeAllAnimations() {
    let atLeastOneAnimationToPlay = false
    this.forEach((fbx) => {
      if (fbx.resumeAnimation() == true) {
        atLeastOneAnimationToPlay = true
      }
    })
    return atLeastOneAnimationToPlay
  }

  /** TODO */
  replayAllAnimations() {

  }

  /** TODO */
  updateAllElementsAnimation(frameTimeReference_) {
    let atLeastOneElementToAnimate = false
    this.forEach(fbxElem => {
      if (!fbxElem.isPaused) {
        atLeastOneElementToAnimate = true
        fbxElem._update();
        fbxElem.updateTimeSlider();
      }
    });
    return atLeastOneElementToAnimate;
  }

  /** TODO   */
  toggleOneFBXAnimation(objectUuid_) {
    this.getByUUID(objectUuid_).toggleAnimation();
  }

  /** TODO   */
  replayOneFBXAnimation(objectUuid_) {
    this.getByUUID(objectUuid_).replayAnimation();
  }

  /** TODO */
  updateOneTimeSlider(objectUuid_, newValue) {
    this.getByUUID(objectUuid_).updateTimeSlider(newValue)
  }
}

/** Objet contenant l'ensembles des données nécéssaires aux traitement d'un BVH.
 *  Utilisé dans BVHAnimationArray
 */
class FBXAnimationElement {
  /**
   *  @param {*} name_ le nom du FBX
   */
  constructor(name_, scene, animationMixer_) {
    this.name = name_;
    this.scene = scene;
    this.isPaused = false;
    this.resumeAnimationValue = this.isPaused;
    this.clock = new THREE.Clock();
    this.clip = animationMixer_;
    this.nbSecondesOfAnimations = this.clip._root.animations[0].duration;
    this.diff = 0;
    // Pause/Play
    this.playPauseButton = $("#" + this.uuid + " .playPause")[0];

    //Time Slider
    this.timeSlider = $("#" + this.uuid + " .timeSlider")[0];
    this.timeSlider.max = this.nbSecondesOfAnimations;
    this.timeSlider.min = 0;
    this.timeSlider.valueAsNumber = this.timeSlider.min;
  }

  /** TODO */
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

  /** TODO */
  resumeAnimation() {
    this.isPaused = this.resumeAnimationValue
    this._updatePlayPauseImg()
    return !this.isPaused
  }

  /** TODO */
  hide() {
    this.scene.getObjectByName(this.uuid).visible = false;
  }

  /** TODO */
  show() {
    this.scene.getObjectByName(this.uuid).visible = true;
  }

  /** TODO */
  replayAnimation(resetResumeAnim) {
    if (resetResumeAnim == true) this.resumeAnimationValue = false;
    this.clip.update(-(this.clock.getElapsedTime() + this.diff));
    this.diff = 0;
    this.clock = new THREE.Clock();
    this.timeSlider.valueAsNumber = this.timeSlider.min
    this._updatePlayPauseImg();
  }

  /** TODO */
  updateTimeSlider(target) {
    if (target) {
      this.timeSlider.valueAsNumber = target;
      let val = target - ((this.diff + this.clock.getElapsedTime()) % this.nbSecondesOfAnimations);
      this.diff += val;
      this.clip.update(val);
      console.log(this.timeSlider.valueAsNumber)
    } else {
      this.timeSlider.valueAsNumber = (this.diff + this.clock.getElapsedTime()) % this.nbSecondesOfAnimations;
    }
  }

  /** Met a jour l'image du bouton playPause
   *    - Image de pause si l'object passe en lecture
   *    - Image de lecture si l'object passe en pause
   */
  _updatePlayPauseImg() {
    let img = $('#' + this.uuid + " .playPause")[0].lastChild
    if (this.isPaused) {
      img.src = "./images/play_button.svg"
    } else {
      img.src = "./images/pause_button.svg"
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

  /** Retourne l'uuid du FBX */
  get uuid() {
    return this.clip._root.uuid;
  }

  /** TODO */
  _update() {
    if (this.isPaused == false) {
      this.clip.update(this.clock.getDelta());
    }
  }
}