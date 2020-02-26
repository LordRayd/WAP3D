//scene,  et renderer et camera sont défini dans WAP3D.js
//framerateTimeReference et currentScreenFrameTime sont défini dans WAP3D.js
//updateFrameTime() et initialisePlayer() sont défini dans WAP3D.js

/**
 * permet d'obtenir le frame time (inverse du framerate) global du bvh
 * @param {*} strArray 
 */
function getBvhFrameTime(strArray) {
    let floatRegex = /[+-]?\d+(\.\d+)?/g
    for (let i of strArray) {
        if (i.search("Frame Time:") != -1) {
            return parseFloat(i.match(floatRegex)[0])
        }
    }
    console.log("getBvhFrameTime failed")
    return -1
}

/**
 * Sélectionne, associe et lance un bvh dans le lecteur
 */
function associateBVH() {
    let files = this.files;
    if (files.length === 0) {
        console.log('No file is selected');
        return;
    }

    let reader = new FileReader();
    reader.onload = function (event) {

        let bvhStringArray = event.target.result.split('\n')

        let fileFrameTime = getBvhFrameTime(bvhStringArray)

        let root = BVHImport.readBvh(bvhStringArray);

        let animation = BVHImport.toTHREE(root);
        console.log(animation)

        // nouvelle mesh pour représenter le squelette
        let geometry = new THREE.BufferGeometry();
        let material = new THREE.MeshPhongMaterial({ skinning: true });
        let mesh = new THREE.SkinnedMesh(geometry, material);

        // bind du squelette
        mesh.add(animation.skeleton.bones[0]);
        mesh.bind(animation.skeleton);

        // figure finale
        skeletonHelper = new THREE.SkeletonHelper(mesh);
        skeletonHelper.material.linewidth = 1;

        scene.add(skeletonHelper);
        scene.add(mesh);

        //permet de gérer les timings d'animations asynchrones entre eux et avec le framerate
        mixer = new THREE.AnimationMixer(mesh);
        mixer.clipAction(animation.clip).play()

        let c = false
        function animate() {
            mixer.timeScale = currentScreenFrameTime / fileFrameTime
            updateFrameTime()

            if (c == false) {
                skeletonHelper.material.linewidth += 0.2
                if (skeletonHelper.material.linewidth >= 5) {
                    c = true
                }
            }
            if (c == true) {
                skeletonHelper.material.linewidth -= 0.2
                if (skeletonHelper.material.linewidth <= 0.05) {
                    c = false
                }
            }
            requestAnimationFrame(animate)
            renderer.render(scene, camera)
            mixer.update(fileFrameTime)
        }
        animate()
    };
    reader.readAsText(files[0]);
}