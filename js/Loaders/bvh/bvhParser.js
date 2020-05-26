/** La hauteur du pelvis prise en référence pour une mise à l'echelle */
const pelvisYReference = 75

class BVHParser {
  constructor(bvhFileContent) {
    if (!bvhFileContent) {
      throw "expected arg 1 : bvh files content "
    } else {
      let bvhAsLinesArray = bvhFileContent.split('\n')
      this.bonesHierarchy = this._readBvh(bvhAsLinesArray)
      this.animation = this._bvhBonesHierarchyToTHREESkeletonAndAnimationClip(this.bonesHierarchy)
    }
  }

  /** Permet la lecture d'un bvh ligne par ligne
   *  Chaque categorie fait appel a une fonction pour parser et recuperer les informations de cette categorie
   * 
   *  categorie : 
   *    - HIERARCHY
   *    - MOTION
   *    - Frames
   *    - Frame Time
   *    - Reste du fichier ou apparaisse les angles de chaques partie du corp poru chaque frame
   * 
   *  @param bvhAsLinesArray : un fichier bvh sous forme de tableau de string
   * 
   *  @return bonesHierarchy : hierarchy des os (sous la forme decrite dans la doc de la fonction _readHierarchySection)
   */
  _readBvh(bvhAsLinesArray) {
    let lines = bvhAsLinesArray.map(_ => _.slice())
    if (lines.shift().trim().toUpperCase() != "HIERARCHY") {
      throw "HIERARCHY expected"
    } else {
      let hierarchyAndResultingLines = this._readHierarchySection(lines, [])
      let bonesHierarchy = hierarchyAndResultingLines.bonesHierarchy
      lines = hierarchyAndResultingLines.lines
      if (lines.shift().trim().toUpperCase() != "MOTION") {
        throw "MOTION expected"
      } else {
        // Frames: nbF
        this.nbFrames = parseInt((lines.shift().trim().split(/[\s]+/)[1]), 10)

        // Frame Time: ft
        this.frameTime = parseFloat(lines.shift().trim().split(/[\s]+/)[2])

        this._associateFramesToHierarchy(lines, this.nbFrames, this.frameTime, bonesHierarchy)
        return bonesHierarchy
      }
    }
  }

  /** Parse la section HIERARCHY du bvh
   *  
   *  @return { bonesHierarchy, lines}
   *  - bonesHierarchy : tableau contenant chaque node
   *      - un node contient 
   *          - son nom
   *          - son type 
   *          - un tableau contenant ses enfant dans l'arbe
   *          - une liste vide pour y placer les frames du node
   * 
   *  - lines : reste des ligne encore a parser
   */
  _readHierarchySection(lines, list) {
    let firstLine = lines.shift().trim();
    let bonesHierarchy = readHierarchySectionRec(lines, firstLine, list)
    return { bonesHierarchy: bonesHierarchy, lines: lines }

    function readHierarchySectionRec(lines, firstLine, list) {
      let node = { name: "", type: "", frames: [] }
      list.push(node)

      let tokens = firstLine.split(/[\s]+/)

      // Tokens
      if (tokens[0].toUpperCase() === "END") { // End Site
        node.type = "ENDSITE"
        node.name = "ENDSITE"
      } else { // autre
        node.type = tokens[0].toUpperCase()
        node.name = tokens[1]
      }

      // remove "{"
      lines.shift()

      // OFFSET
      let offsets = lines.shift().trim().split(/[\s]+/)
      node.offset = { x: parseFloat(offsets[1]), y: parseFloat(offsets[2]), z: parseFloat(offsets[3]) }

      if (node.type !== "ENDSITE") {
        // CHANNELS
        let channels = lines.shift().trim().split(/[\s]+/)
        channels.shift() // mot clef : Channels 
        let nbChannels = parseInt(channels.shift(), 10)
        node.channels = channels
        node.childrens = []
      }
      let nextLine = lines.shift().trim()
      while (nextLine !== "}") {
        // Enfants
        let children = readHierarchySectionRec(lines, nextLine, list)
        node.childrens.push(children)
        nextLine = lines.shift().trim()
      }
      return node
    }
  }

  /** Associe pour chacun des os de la hierarchy, la frame correspondante
   *  - temps / moment de la frame
   *  - position x, y, z (uniquement pour le pelvis)
   *  - rotation
   */
  _associateFramesToHierarchy(lines, nbFrames, frameTime, bonesHierarchy) {
    let rad = Math.PI / 180
    let that = this
    for (let i = 0; i < nbFrames; i++) {
      associateFramesToHierarchyRec(lines.shift().trim().split(/[\s]+/), frameTime * i, bonesHierarchy)
    }

    function associateFramesToHierarchyRec(lines, timeOfFrame, currBone /* bone */ ) {
      if (currBone.type !== "ENDSITE") {
        let keyFrame = {
          timeOfFrame: timeOfFrame,
          position: { x: 0, y: 0, z: 0 },
          rotation: new rotationQuaternion()
        }

        currBone.frames.push(keyFrame)

        currBone.channels.forEach(channel => {
          let channelValue = parseFloat(lines.shift().trim())
          let rotQuat = new rotationQuaternion()
          switch (channel) {
            case "Xposition":
              keyFrame.position.x = channelValue
              break
            case "Yposition":
              if (timeOfFrame == 0) {
                that.sizeFactor = pelvisYReference / channelValue
              }
              keyFrame.position.y = channelValue
              break
            case "Zposition":
              keyFrame.position.z = channelValue
              break
            case "Zrotation":
              rotQuat.setxyzFromAxisAngle(0, 0, 1, channelValue * rad)
              keyFrame.rotation.multiply(rotQuat)
              break
            case "Yrotation":
              rotQuat.setxyzFromAxisAngle(0, 1, 0, channelValue * rad)
              keyFrame.rotation.multiply(rotQuat)
              break
            case "Xrotation":
              rotQuat.setxyzFromAxisAngle(1, 0, 0, channelValue * rad)
              keyFrame.rotation.multiply(rotQuat)
              break
          }
        })

        currBone.childrens.forEach(children => {
          associateFramesToHierarchyRec(lines, timeOfFrame, children)
        })
      }
    }
  }

  /** Renvoie un objet contenant le skelette et le clip a partir de la hierarchy des os passe en parametre
   *  
   * @return { skeleton, clip } correspondant a la hierarchie
   *  - skeleton : objet THREE.Skeleton()
   *  - clip : objet THREE.AnimationClip()
   */
  _bvhBonesHierarchyToTHREESkeletonAndAnimationClip(bonesHierarchy) {
    let THREEBones = bvhThreeHierarchyToTHREEBonesRec(bonesHierarchy, []).threeBone

    return {
      skeleton: new THREE.Skeleton(THREEBones),
      clip: this._bvhBonesHierarchyToTHREEAnimation(bonesHierarchy)
    }

    /** Renvoie un objet contenant les os et le squelette
     * 
     * @return {array} Les os et le squelette
     */
    function bvhThreeHierarchyToTHREEBonesRec(currBone, threeHierarchy) {
      let bone = new THREE.Bone()
      threeHierarchy.push(bone)
      bone.position.add(currBone.offset)
      bone.name = currBone.name
      if (currBone.type !== "ENDSITE") {
        currBone.childrens.forEach(children => {
          bone.add(bvhThreeHierarchyToTHREEBonesRec(children, threeHierarchy).bone)
        })
      }
      return { bone: bone, threeBone: threeHierarchy }
    }
  }

  /** Renvoie l'animation correspondant à la hierarchy des os entrée en paramètre
   *
   * @param {object} bonesHierarchy La hierarchy d'os
   *
   * @return objet THREE.AnimationClip()
   */
  _bvhBonesHierarchyToTHREEAnimation(bonesHierarchy) {
    let flatBonesHierachy = this._flattenHierarchy(bonesHierarchy)
    let tracks = []

    flatBonesHierachy.forEach(bone => {
      if (bone.type !== "ENDSITE") {
        let times = []
        let pos = []
        let rot = []

        bone.frames.forEach(frame => {
          times.push(frame.timeOfFrame)
          pos.push(frame.position.x + bone.offset.x)
          pos.push(frame.position.y + bone.offset.y)
          pos.push(frame.position.z + bone.offset.z)

          rot.push(frame.rotation.x)
          rot.push(frame.rotation.y)
          rot.push(frame.rotation.z)
          rot.push(frame.rotation.w)
        })
        tracks.push(new THREE.VectorKeyframeTrack(
          ".bones[" + bone.name + "].position", times, pos))
        tracks.push(new THREE.QuaternionKeyframeTrack(
          ".bones[" + bone.name + "].quaternion", times, rot))
      }
    })
    return new THREE.AnimationClip("animation", -1, tracks)
  }

  /** Renvoie la hierarchy des os dans un tableau a une dimension a partir de la hierarchy des os crée par readBvh
   *
   * @param {object} bonesHierarchy La hierarchy d'os
   *
   * @returns Un tableau une dimension contenant les os de la hierarchy
   */
  _flattenHierarchy(bonesHierarchy) {
    return flattenHierarchyRec(bonesHierarchy, [])

    /** Methode recursive qui met les os dans un tableau à une dimension
     *
     * @param {} currBone L'os observé
     * @param {} flatHierachyList La liste à une dimension dans laquelle ajouté les os
     *
     * @returns Une liste à une dimension contenant les os de la hierarchy
     */
    function flattenHierarchyRec(currBone, flatHierachyList) {
      flatHierachyList.push(currBone);
      if (currBone.type !== "ENDSITE") {
        currBone.childrens.forEach(children => {
          flattenHierarchyRec(children, flatHierachyList);
        })
      }
      return flatHierachyList
    }
  }

  /** @return le Frame Time du bvh*/
  getFrameTime() {
    console.debug("frameTime: ", this.frameTime)
    return this.frameTime
  }

  /** @return le Nombre de frame total du bvh */
  getNbFrames() {
    console.debug("nbFrames: ", this.nbFrames)
    return this.nbFrames
  }

  /** @return objet THREE.AnimationClip() correspondant du bvh */
  getAnimation() {
    return this.animation
  }

  /** @return le hierarchy des os (sous la forme decrite dans la doc de la fonction _readHierarchySection) */
  getBonesHierarchy() {
    return this.bonesHierarchy
  }

  /** @return facteur de taille squelette, correpondant a la position de reference prise pour
   * le pelvis divise par la position du pelvis dans le bvh*/
  getSizeFactor() {
    return this.sizeFactor
  }
}

class rotationQuaternion {
  x = 0
  y = 0
  z = 0
  w = 1

  /** Initialise le Quaternion a partir de la valeur angulaire x ou y ou z */
  setxyzFromAxisAngle(ax, ay, az, angle) {
    let halfAngle = angle * 0.5
    let sinHalfAngle = Math.sin(halfAngle)

    this.x = ax * sinHalfAngle
    this.y = ay * sinHalfAngle
    this.z = az * sinHalfAngle
    this.w = Math.cos(halfAngle)
  }

  /** Met a jour le Quaternion en le multipliant avec un autre Quaternion */
  multiply(quat2) {
    let q1w = this.w, // a1
      q1x = this.x, // b1
      q1y = this.y, // c1
      q1z = this.z // d1

    let q2w = quat2.w, // a2
      q2x = quat2.x, // b2
      q2y = quat2.y, // c2
      q2z = quat2.z // d2

    this.x = q1x * q2w + q1w * q2x + q1y * q2z - q1z * q2y
    this.y = q1y * q2w + q1w * q2y + q1z * q2x - q1x * q2z
    this.z = q1z * q2w + q1w * q2z + q1x * q2y - q1y * q2x
    this.w = q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z
  }
}