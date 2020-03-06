const pelvisYReference = initialCameraPosition / 2

class BVHParser {
    constructor(bvhFileContent) {
        if (!bvhFileContent) {
            throw "expected arg 1 : bvh files content "
        } else {
            let bvhAsLinesArray = bvhFileContent.split('\n')
            this.bonesHierarchy = this._readBvh(bvhAsLinesArray)
            this.animation = this._bvhBonesHierarchyToTHREEBonesAndAnimationClip(this.bonesHierarchy)
        }
    }

    /** TODO */
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

    /** TODO */
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

    /** TODO */
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

    /** TODO */
    _bvhBonesHierarchyToTHREEBonesAndAnimationClip(bonesHierarchy) {
        let THREEBones = bvhThreeHierarchyToTHREEBonesRec(bonesHierarchy, []).threeBone

        return {
            skeleton: new THREE.Skeleton(THREEBones),
            clip: this._bvhBonesHierarchyToTHREEAnimation(bonesHierarchy)
        }

        /** TODO */
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

    /** TODO */
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

    /** TODO */
    _flattenHierarchy(bonesHierarchy) {
        return flattenHierarchyRec(bonesHierarchy, [])

        /** TODO */
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

    /** TODO */
    getFrameTime() {
        console.debug("frameTime: ", this.frameTime)
        return this.frameTime
    }

    /** TODO */
    getNbFrames() {
        console.debug("nbFrames: ", this.nbFrames)
        return this.nbFrames
    }

    /** TODO */
    getAnimation() {
        return this.animation
    }

    /** TODO */
    getBonesHierarchy() {
        return this.bonesHierarchy
    }

    /** TODO */
    getSizeFactor() {
        return this.sizeFactor
    }
}

class rotationQuaternion {
    x = 0
    y = 0
    z = 0
    w = 1

    /** TODO */
    setxyzFromAxisAngle(ax, ay, az, angle) {
        let halfAngle = angle * 0.5
        let sinHalfAngle = Math.sin(halfAngle)

        this.x = ax * sinHalfAngle
        this.y = ay * sinHalfAngle
        this.z = az * sinHalfAngle
        this.w = Math.cos(halfAngle)
    }

    /** TODO */
    multiply(quatB) {
        let quatA = {...this }
        this.x = quatA.x * quatB.w + quatA.w * quatB.x + quatA.y * quatB.z - quatA.z * quatB.y
        this.y = quatA.y * quatB.w + quatA.w * quatB.y + quatA.z * quatB.x - quatA.x * quatB.z
        this.z = quatA.z * quatB.w + quatA.w * quatB.z + quatA.x * quatB.y - quatA.y * quatB.x
        this.w = quatA.w * quatB.w - quatA.x * quatB.x - quatA.y * quatB.y - quatA.z * quatB.z
    }
}