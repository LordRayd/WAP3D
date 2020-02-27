//scene, renderer et camera sont défini dans WAP3D.js
//framerateTimeReference et currentScreenFrameTime sont défini dans WAP3D.js
//updateFrameTime() et initialisePlayer() sont défini dans WAP3D.js

let bvhFilesLoaded = false

/**
 * permet d'obtenir le frame time (inverse du framerate) global du bvh
 * @param bvhStrArray : le fichier bvh sous forme d'un tableau de string
 */
function getBvhFrameTime(bvhStrArray) {
    let floatRegex = /[+-]?\d+(\.\d+)?/g
    return bvhStrArray.some(line => {
        if (line.search("Frame Time:") != -1) {
            return parseFloat(line.match(floatRegex)[0])
        }
    })
}

/**
 * Sélectionne, associe et lance un bvh dans le lecteur
 */
function associateBVH(animate) {
    let files = this.files; // Le this désigne le contexte courant !
    bvhFilesLoaded = "loading"
    if (files.length === 0) {
        console.log('No file is selected');
        return;
    }

    let reader = new FileReader();
    reader.onload = function(event) {

        let bvhStringArray = event.target.result.split('\n')
        let fileFrameTime = getBvhFrameTime(bvhStringArray)
        let root = BVHImport.readBvh(bvhStringArray);
        let animation = BVHImport.toTHREE(root);

        // nouvelle mesh pour représenter le squelette
        let geometry = new THREE.BufferGeometry();
        let material = new THREE.MeshPhongMaterial({ skinning: true });
        let mesh = new THREE.SkinnedMesh(geometry, material);

        // bind du squelette
        mesh.add(animation.skeleton.bones[0]);
        mesh.bind(animation.skeleton);

        // figure finale
        let skeletonHelper = new THREE.SkeletonHelper(mesh);
        skeletonHelper.material.linewidth = 2;

        scene.add(skeletonHelper);
        scene.add(mesh);

        //permet de gérer les timings d'animations asynchrones entre eux et avec le framerate
        let mixer = new THREE.AnimationMixer(mesh);
        mixer.clipAction(animation.clip).play()

        bvhAnimationsArray.push([skeletonHelper, mixer, fileFrameTime])
    };

    let i = 0
    let waitForDoneInterval = setInterval(function() {
        if (reader.readyState === 2 || reader.readyState === 0) {
            reader.readAsText(files[i]); // Async
            i++
            if (i === files.length) {
                clearInterval(waitForDoneInterval)
                bvhFilesLoaded = "loaded"
                testCallBack()
            }
        }
    }, 5);
}

function getLoadingState() {
    return bvhFilesLoaded
}