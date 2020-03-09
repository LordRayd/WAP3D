//scene, renderer et camera sont défini dans WAP3D.js
//framerateTimeReference et currentScreenFrameTime sont défini dans WAP3D.js
//updateFrameTime() et initialisePlayer() sont défini dans WAP3D.js

let bvhFilesloadingState = false
let progressBar = $('<div id="progressBar" hidden></div>')
progressBar.append('<div id="progressValue"></div>')
progressBar.append('<div id="currProgress"></div>')


/**
 * TODO
 * initialisation par UUID 
 * pour permettre de supprimer des éléments du tab sans perte d'ordre ?
 */
function addBVHToObjectList(uuid_, name, frameTime, nbFrames) {
    console.log(name)
    $("#bvhList").append('<div id="' + uuid_ + '" class="object">' + name + '\t' + nbFrames + '</div>')
}


/**
 * Sélectionne, associe et lance un bvh dans le lecteur
 */
function associateBVH(filesToLoad, scene, bvhAnimationsArray) {
    console.log(filesToLoad.currentTarget.files)
    let files = filesToLoad.currentTarget.files; // Le this désigne le contexte courant !
    bvhFilesloadingState = "loading"
    let nbFileToLoad = files.length
    if (nbFileToLoad === 0) {
        console.info('No file is selected');
    } else {
        console.info('Start loading ', nbFileToLoad, ' files');
        $("#messagePlayer").text("Chargement en cours : " + nbFileToLoad + " fichiers.")
        let nbLoadedFiles = 0
        let reader = new FileReader();

        reader.onload = function (event) {
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

            console.log(bvhAnimationsArray)
            bvhAnimationsArray[testLen + nbLoadedFiles].push(skeletonHelper, mixer, bvhFile.getFrameTime(), bvhFile.getNbFrames())
            addBVHToObjectList(skeletonHelper.uuid, bvhAnimationsArray[testLen + nbLoadedFiles][0], bvhFile.getFrameTime(), bvhFile.getNbFrames())
            nbLoadedFiles += 1

        };

        let fileIndex = 0
        let controlDiv = $("#control") // sauvegarde de la div dans son état actuel
        let loadingPercentage = "0%"

        let testLen = bvhAnimationsArray.length
        let waitForDoneInterval = setInterval(function () {
            if (reader.readyState === 2 || reader.readyState === 0) {
                console.debug('Loading file : ', fileIndex);

                // Barre de chargement
                $("#control").replaceWith(progressBar.show())
                loadingPercentage = parseInt((fileIndex * 100) / nbFileToLoad, 10) + "%"
                $("#currProgress")[0].style.width = loadingPercentage
                $("#progressValue").text(loadingPercentage)

                bvhAnimationsArray.push([files[fileIndex].name])
                reader.readAsText(files[fileIndex]); // Async
                fileIndex += 1
                if (fileIndex === nbFileToLoad) {
                    clearInterval(waitForDoneInterval)
                    // Attente du chargement total des ficheir avant de rendre la main
                    let waitForLoadedFileInArray = setInterval(_ => {
                        if (nbLoadedFiles === nbFileToLoad) {
                            $("#progressBar").replaceWith(controlDiv)
                            clearInterval(waitForLoadedFileInArray)
                            bvhFilesloadingState = "loaded"
                            fileLoadedCallBack()
                        }
                    }, 10)
                }
            }
        }, 5);
    }
}

/** TODO */
function getLoadingState() {
    return bvhFilesloadingState
}