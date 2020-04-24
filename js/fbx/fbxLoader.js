class FbxLoader {

    /**
     * @param scene La scene associer
    */
    constructor(scene) {
        this.scene = scene;
    }

    loadFbxModel() {
        var loader = new THREE.FBXLoader();
        var scene = this.scene;

        loader.load('./ressources/fbx/xbot-model.fbx', function (object) {
            console.log(object.animations.length);
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            scene.add(object);
        });
    }
}