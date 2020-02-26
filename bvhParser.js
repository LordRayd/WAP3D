var scene
var renderer
var camera

function associateBVH() {
    let files = this.files;
    if (files.length === 0) {
        console.log('No file is selected');
        return;
    }

    let reader = new FileReader();
    reader.onload = function (event) {

        let bvhStringArray = event.target.result.split('\n')
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
        mixer.timeScale = 2

        mixer.clipAction(animation.clip).play()

        let c = false
        function animate() {
            if (c == false) {
                skeletonHelper.material.linewidth += 0.2
                if (skeletonHelper.material.linewidth >= 10) {
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
            mixer.update(0.008333)
        }
        animate()


    };
    reader.readAsText(files[0]);


}

function initialisePlayer() {

    document.getElementById('fileSelector').addEventListener('change', associateBVH)

    scene = new THREE.Scene()

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(document.getElementById("player").offsetWidth, document.getElementById("player").offsetHeight)
    document.getElementById("player").appendChild(renderer.domElement)
    window.onresize = _ => { renderer.setSize(document.getElementById("player").offsetWidth, document.getElementById("player").offsetHeight) }

    camera = new THREE.PerspectiveCamera(90, document.getElementById("player").offsetWidth / document.getElementById("player").offsetHeight, 0.1, 1000)
    camera.position.z = 150
    camera.position.y = 150
    camera.lookAt(0, 150, 0)

    let referenceGrid = new THREE.GridHelper(1000, 50);
    scene.add(referenceGrid);

    renderer.render(scene, camera)
}

/*
Verif lines regex : ((\s+)-?([0-9]+)\.[0-9]+){66}
*/