class AdvancedControlWindow {

    //Calculé qu'une seule fois, peut amélioré le temps de réponse du lancement de fenêtre
    static HTMLcontent = $('\
            <div>\
                <ul> \
                    <li><a href="#advancedCtrl-graphs">Graphs</a></li>\
                    <li><a href="#advancedCtrl-rendering">Rendering Options</a></li>\
                    <li><a href="#advancedCtrl-selection">Display Selection</a></li>\
                </ul>\
                <div id="advancedCtrl-graphs">\
                </div>\
                <div id="advancedCtrl-rendering">\
                    <ul>\
                    <li><input id="speedRatioSelector" type="number" step="0.25" min="0" onkeypress="return event.charCode != 45"></li>\
                    <li>\
                        <label for="orthoEnabled"> Affichage d\'un repère orthonormé pour chaque articulation</label>\
                        <input type="checkbox" name="orthoEnabled" id="orthoEnabled">\
                    </li>\
                    <li>\
                        <p> Rendering mode: </p>\
                        <label for="WireFrame">WireFrame</label>\
                        <input type="radio" id="renderModeWireFrame" name="renderMode" value="WireFrame"><br>\
                        <label for="Cubic">Cubic</label>\
                        <input type="radio" id="renderModeCubic" name="renderMode" value="Cubic"><br>\
                    </li>\
                    </ul>\
                </div>\
                <div id="advancedCtrl-selection">\
                </div>\
            </div>\
        ').tabs()

    constructor(uuidCollection_, windowType_, playerContext_) {
        this.player = playerContext_
        this.UUIDs = [...uuidCollection_]
        this.type = windowType_

        switch (this.type) {
            //TODO système pour avoir plusieur fenêtre de ctrl avancé par type de modèle
            case "bvh":
                if ($("#advancedControlForBVH").length > 0) throw new Error("bvh controls currently launched")

                if (!(this.UUIDs.every((value) => this.bvhAnimationsArray.contains(value)))) {
                    throw new Error("1 or more bvh UUID invalid, have you mixed FBX and BVH in selection ?")
                }

                if (this.UUIDs.length == 1) $("body").append('<div id="advancedControlForBVH" title="Advanced Controls"></div>')
                else $("body").append('<div id="advancedControlForBVH" title="Advanced Controls (multiple elements)"></div>')

                $("#advancedControlForBVH").append(this.HTMLcontent)
                break

            case "fbx":
                if ($("#advancedControlForFBX").length > 0) throw new Error("fbx controls currently launched")

                if (!(this.UUIDs.every((value) => this.fbxAnimationsArray.contains(value)))) {
                    throw new Error("1 or more fbx UUID invalid, have you mixed FBX and BVH in selection ?")
                }

                if (this.UUIDs.length == 1) $("body").append('<div id="advancedControlForFBX" title="Advanced Controls"></div>')
                else $("body").append('<div id="advancedControlForFBX" title="Advanced Controls (multiple elements)"></div>')

                $("#advancedControlForFBX").append(this.HTMLcontent)
                break

            default:
                throw new Error("Tried to create AdvancedControlWindow with unknown parameter \"" + this.type + "\"")
        }

    }

    /** Remplie la fenêtre de son contenu et associe les actions liés à chaque éléments de la fenêtre */
    launch() {
        let targetedCollection

        if (this.type === "bvh") targetedCollection = this.player.bvhAnimationsArray
        else if (this.type === "fbx") targetedCollection = this.player.fbxAnimationsArray
        else throw new Error("unsupported type for launching advanced controls");

        this.UUIDs.forEach((uuid) => {
            this.player.toggleObjectInListVisibility(uuid, true)
        })

        $("#speedRatioSelector").change((object) => {
            let newTimeScaleValue = object.target.valueAsNumber
            this.UUIDs.forEach((uuid) => targetedCollection.bvhAnimationsArray.getByUUID(uuid).speedRatio = newTimeScaleValue)
        })

        this.UUIDs.forEach((uuid) => {
            let graphsHierarchyString = this._browseThroughSkeleton(targetedCollection.getByUUID(uuid).skeleton)
            let displayHierarchyString = this._browseThroughSkeleton(targetedCollection.getByUUID(uuid).skeleton, '<input type="checkbox" checked>')

            $("#advancedCtrl-graphs").append('<div class="CtrlList"><p class="title">' + targetedCollection.getByUUID(uuid).name + '</p>' + graphsHierarchyString + '</div>')
            $("#advancedCtrl-selection").append('<div class="CtrlList"><p class="title">' + targetedCollection.getByUUID(uuid).name + '</p>' + displayHierarchyString + '</div>')

            $("#advancedCtrl-rendering #renderModeWireFrame").on("click", event => { targetedCollection.getByUUID(uuid).wireframe = $("#renderModeWireFrame")[0].checked })
            $("advancedCtrl-rendering #renderModeCubic").on("click", event => { targetedCollection.getByUUID(uuid).wireframe = $("#renderModeWireFrame")[0].checked })
        })

        $("#advancedCtrl-rendering #orthoEnabled").on("click", (event) => {
            let isEnabled = $(event.target).is(":checked")
            this.UUIDs.forEach((uuid) => {
                targetedCollection.getByUUID(uuid).skeleton.bones.forEach(elem => elem.axis.visible = isEnabled)
            })
        })

        $("#advancedCtrl-graphs .CtrlList div").on("dblclick", (event) => {
            let nodeName = event.target.textContent
            //TODO Déplacer tout ça dans IEM
            $("body").append('<div id="nodeGraph" title="Node Observation Window (' + nodeName + ')"></div>')
            $("#nodeGraph").dialog({
                height: 640,
                width: 640,
                close: (event, ui) => {
                    $("#nodeGraph").empty()
                    $("#nodeGraph").remove()
                }
            })
            let targetUUID = $(event.target.parentElement).attr("data-uuid")
            if (nodeName === "Hips") {
                Plotly.react($("#nodeGraph")[0], this._translationGraphData(targetUUID));
            } else {
                Plotly.react($("#nodeGraph")[0], this._rotationGraphData(nodeName, targetUUID));
            }
        })

        $("#advancedControlForBVH").dialog({
            height: 480,
            width: 640,
            close: (event, ui) => {
              arrayClone.forEach((uuid) => {
                $("#" + uuid).css("background-color", "white")
              })
              $("#advancedControlForBVH").empty()
              $("#advancedControlForBVH").remove()
              this.bvhAnimationsArray.highlightElements()
            }
          })
    }

    /** Parse le skelette et fourni une liste de listes HTML correspondant au squelette (sous forme de string)
     * 
     *  @param {THREE.Skeleton}
     *  @param {String} additionalTag_ Balise supplémentaire optionnelle
     * 
     *  @returns {String} le squelette sous forme de liste de liste HTML
     */
    _browseThroughSkeleton(skeleton_, additionalTag_ = "") {
        let uuid = skeleton_.uuid
        let recursiveNavigation = (object) => {
            let result = ""
            object.children.forEach((obj) => {
                if (!(obj.name === "ENDSITE")) {
                    if (obj.children[0] === "ENDSITE") result = result + '<li><div data-uuid="' + uuid + '"><p>' + obj.name + "</p>" + additionalTag_ + "</div></li>"
                    else result = result + '<li><div data-uuid="' + uuid + '"><p>' + obj.name + "</p>" + additionalTag_ + "</div><ul>" + recursiveNavigation(obj) + "</ul>" + "</li>"
                }
            })
            return result
        }

        return '<div data-uuid="' + uuid + '"><p>Hips</p>' + additionalTag_ + '</div><ul>' + recursiveNavigation(skeleton_.bones[0]) + "</ul>"
    }

    /** Renvoie le graph des translations X Y Z de la node "Hips" du BVH correspondant au UUID donné, exploitable par plotly.js
     * 
     *  @param {UUID} targetUUID_ Le UUID du BVH cible
     */
    _translationGraphData(targetUUID_) {
        let graphData = [...this.player.bvhAnimationsArray.getByUUID(targetUUID_).clip._actions[0]._clip.tracks[0].values.values()]
        let xAxis = Array(Math.floor(graphData.length / 3)).keys()

        return [{
            x: xAxis,
            y: graphData.map((val, index) => { if (index % 3 === 0) return val }),
            marker: { color: 'red' },
            name: 'X',
            mode: 'markers',
            simplify: true
        }, {
            x: xAxis,
            y: graphData.map((val, index) => { if (index % 3 === 1) return val }),
            marker: { color: 'green' },
            name: 'Y',
            mode: 'markers',
            simplify: true
        }, {
            x: xAxis,
            y: graphData.map((val, index) => { if (index % 3 === 2) return val }),
            marker: { color: 'blue' },
            name: 'Z',
            mode: 'markers',
            simplify: true
        }]
    }

    /** Renvoie le graph des rotations X Y Z de la node donnée du BVH correspondant au UUID donné, exploitable par plotly.js
     * 
     *  @param {UUID} targetUUID_ Le UUID du BVH cible
     *  @param {String} nodeName_ le nom du noeud à observer
     */
    _rotationGraphData(nodeName_, targetUUID_) {

        let nameInClip = ".bones[" + nodeName_ + "].quaternion"
        let graphData = this.player.bvhAnimationsArray.getByUUID(targetUUID_).clip._actions[0]._clip.tracks.filter((elem) => elem.name == nameInClip).flatMap((elem) => [...elem.values.values()])
        let xAxis = Array(Math.floor(graphData.length / 3)).keys()

        return [{
            x: xAxis,
            y: graphData.map((val, index) => { if (index % 4 === 0) return val }),
            marker: { color: 'red' },
            name: 'X',
            mode: 'markers',
            simplify: true
        }, {
            x: xAxis,
            y: graphData.map((val, index) => { if (index % 4 === 1) return val }),
            marker: { color: 'green' },
            name: 'Y',
            mode: 'markers',
            simplify: true
        }, {
            x: xAxis,
            y: graphData.map((val, index) => { if (index % 4 === 2) return val }),
            marker: { color: 'blue' },
            name: 'Z',
            mode: 'markers',
            simplify: true
        }, {
            x: xAxis,
            y: graphData.map((val, index) => { if (index % 4 === 3) return val }),
            marker: { color: 'grey' },
            name: 'W',
            mode: 'markers',
            simplify: true
        }]
    }

}