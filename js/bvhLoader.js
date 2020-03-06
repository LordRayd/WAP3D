//scene, renderer et camera sont défini dans WAP3D.js
//framerateTimeReference et currentScreenFrameTime sont défini dans WAP3D.js
//updateFrameTime() et initialisePlayer() sont défini dans WAP3D.js

let bvhFilesLoaded = false

/**
 * Sélectionne, associe et lance un bvh dans le lecteur
 */
function associateBVH() {
    let files = this.files; // Le this désigne le contexte courant !
    bvhFilesLoaded = "loading"
    if (files.length === 0) {
        console.info('No file is selected');
    } else {
        console.info('Start loading ', files.length, ' files');
        let reader = new FileReader();

        reader.onload = function(event) {
            let bvhFile = new BVHParser(event.target.result)
            let animation = bvhFile.getAnimation()

            // nouvelle mesh pour représenter le squelette
            let geometry = new THREE.BufferGeometry();
            let material = new THREE.MeshPhongMaterial({ skinning: true });
            let mesh = new THREE.SkinnedMesh(geometry, material);

            // bind du squelette
            mesh.add(animation.skeleton.bones[0]);
            mesh.bind(animation.skeleton);

            mesh.scale.x = bvhFile.getSizeFactor()
            mesh.scale.y = bvhFile.getSizeFactor()
            mesh.scale.z = bvhFile.getSizeFactor()
            console.debug(mesh.scale)

            // figure finale
            let skeletonHelper = new THREE.SkeletonHelper(mesh);
            skeletonHelper.material.linewidth = 2;

            scene.add(skeletonHelper);
            scene.add(mesh);

            //permet de gérer les timings d'animations asynchrones entre eux et avec le framerate
            let mixer = new THREE.AnimationMixer(mesh);
            mixer.clipAction(animation.clip).play()

            bvhAnimationsArray.push([skeletonHelper, mixer, bvhFile.getFrameTime()])
        };

        let fileIndex = 0
        let waitForDoneInterval = setInterval(function() {
            if (reader.readyState === 2 || reader.readyState === 0) {
                console.debug('Loading file : ', fileIndex);
                reader.readAsText(files[fileIndex]); // Async
                fileIndex += 1
                if (fileIndex === files.length) {
                    clearInterval(waitForDoneInterval)
                    bvhFilesLoaded = "loaded"
                    fileLoadedCallBack()
                }
            }
        }, 5);
    }
}

function getLoadingState() {
    return bvhFilesLoaded
}