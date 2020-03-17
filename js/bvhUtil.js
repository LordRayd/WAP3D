class BVHAnimationElement {
    /**
     * Objet contenant l'ensembles des données nécéssaires aux traitement
     * d'un BVH.
     * Utilisé en tandeme avec l'objet BVHAnimationArray
     * @param {*} name_ 
     * @param {*} skeleton_ 
     * @param {*} animationMixer_ 
     * @param {*} bvhFile_ 
     */
    constructor(name_, skeleton_, animationMixer_, bvhFile_) {
        this.name = name_
        this.skeleton = skeleton_
        this.clip = animationMixer_
        this.frameTime = bvhFile_.getFrameTime()
        this.nbFrames = bvhFile_.getNbFrames()
    }

    /**
     * Renvoie le uuid correspondant à l'objet.
     * Il s'agit en réalité du uuid du skeleton lié à l'objet
     */
    get uuid() {
        return this.skeleton.uuid
    }
}

class BVHAnimationArray {
    /**
     * Simple outil agissant comme un array classique auquels des fonctionnalité
     * utiles au problèmes liées aux BVH ont été greffé.
     */
    constructor() {
        this.array = new Array()
    }

    /**
     * Performs the specified action for each element in an array.
     * @param {*} function_ 
     */
    forEach(function_) {
        this.array.forEach(function_)
    }

    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param {*} function_ 
     */
    map(function_) {
        return this.array.map(function_)
    }

    /**
     * Appends new elements to an array, and returns the new length of the array.
     * @param {*} element_ 
     */
    push(element_) {
        this.array.push(element_)
    }

    /**
     * Désalloue l'élément à l'uuid correspondant du groupe
     * @param {*} uuid_ 
     * @returns l'index de l'élément supprimé
     */
    removeByUUID(uuid_) {
        for (let index in this.array) {
            if (this.array[index].getuuid() === uuid_) {
                this.array.splice(index, 1)
                return index
            }
        }
    }

    /**
     * Équivalent à array[index_] = element_
     */
    setAtIdx(index_, element_) {
        this.array[index_] = element_
    }

    /**
     * renvoie le maximum globale de frames d'animations
     */
    get byMaxNbOfFrames() {
        return this.array.reduce((bvh0, bvh1) => {
            if (bvh0.nbFrames < bvh1.nbFrames) {
                return bvh1
            } else return bvh0
        })
    }

    /**
     * Retourne l'OBJET ayant l'animation la plus longue de la collection
     */
    get byMaxOverallTime() {
        return this.array.reduce((bvh0, bvh1) => {
            if ((bvh0.nbFrames * bvh0.frameTime) < (bvh1.nbFrames * bvh1.frameTime)) {
                return bvh1
            } else return bvh0
        })
    }

    /**
     * renvoie l'élément avec l'index correspondant
     */
    getByIdx(index_) {
        return this.array[index_]
    }

    /**
     * renvoie l'élément avec le UUID correspondant
     */
    getByUUID(uuid_) {
        for (let elem of this.array) {
            if (elem.getuuid() === uuid_) {
                return elem
            }
        }
    }
}