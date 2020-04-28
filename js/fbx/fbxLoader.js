class FbxLoader {

    /**
     * @param scene La scene associer
    */
    constructor(scene) {
        this.scene = scene;
        this.testarray = [];
        this.loadingState = false
    }

    loadFBX(filesToLoadEvent) {
        return new Promise(async (resolve, reject) => {
            let files = filesToLoadEvent.currentTarget.files;
            try {
                await this._readFBXFiles(files)
                resolve()
            } catch (error) {
                reject(error)
            }
            this.loadingState = "loaded";
        });
    }

    async _readFBXFiles(files) {
        return Promise.all([...files].map(async(file) => {
            return this.loadFbxModel(file)
        }))
    }

    loadFbxModel(fbxFile) {
        var extraFiles = {};
        extraFiles[fbxFile.name] = fbxFile;
        const manager = new THREE.LoadingManager();
        manager.setURLModifier(function (url, path) {
            url = url.split('/');
            url = url[url.length - 1];
            var blobURL = URL.createObjectURL(extraFiles[url]);
            return blobURL;
        });


        var loader = new THREE.FBXLoader(manager);
        var scene = this.scene;

        loader.load(fbxFile.name, function (object) {
            console.log(object.animations.length);
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            scene.add(object);
        });
        this.testarray.push(mixer);
        this.loadingState = 'loaded';
    }
}