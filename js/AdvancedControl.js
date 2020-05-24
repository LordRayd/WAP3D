class AdvancedControlWindow {

    static HTMLcontent = $('\
            <div>\
                <ul> \
                    <li><a href="#advancedCtrl-graphs">Graphs</a></li>\
                    <li><a href="#advancedCtrl-rendering">Rendering Options</a></li>\
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
                    <li class="renderMode" >\
                        <p> Rendering mode: </p>\
                        <label for="WireFrame">WireFrame</label>\
                        <input type="radio" id="renderModeWireFrame" name="renderMode" value="WireFrame"><br>\
                        <label for="Cubic">Cubic</label>\
                        <input type="radio" id="renderModeCubic" name="renderMode" value="Cubic"><br>\
                        <label for="Node">Node</label>\
                        <input type="radio" id="renderModeNode" name="renderMode" value="Node"><br>\
                    </li>\
                    </ul>\
                </div>\
            </div>\
        ')

    constructor(uuidCollection_, windowType_, playerContext_) {
        this.player = playerContext_
        this.UUIDs = [...uuidCollection_]
        this.type = windowType_

        switch (this.type) {
            //TODO système pour avoir plusieur fenêtre de ctrl avancé par type de modèle
            case "bvh":
                if ($("#advancedControlForBVH").length > 0) throw new Error("bvh controls currently launched")

                if (!(this.UUIDs.every((value) => this.player.bvhAnimationsArray.contains(value)))) {
                    throw new Error("1 or more bvh UUID invalid, have you mixed FBX and BVH in selection ?")
                }

                if (this.UUIDs.length == 1) $("body").append('<div id="advancedControlForBVH" title="Advanced Controls"></div>')
                else $("body").append('<div id="advancedControlForBVH" title="Advanced Controls (multiple elements)"></div>')

                $("#advancedControlForBVH").append($(AdvancedControlWindow.HTMLcontent).clone().tabs())
                break

            case "fbx":
                if ($("#advancedControlForFBX").length > 0) throw new Error("fbx controls currently launched")

                if (!(this.UUIDs.every((value) => this.player.fbxAnimationsArray.contains(value)))) {
                    throw new Error("1 or more fbx UUID invalid, have you mixed FBX and BVH in selection ?")
                }

                if (this.UUIDs.length == 1) $("body").append('<div id="advancedControlForFBX" title="Advanced Controls"></div>')
                else $("body").append('<div id="advancedControlForFBX" title="Advanced Controls (multiple elements)"></div>')

                $("#advancedControlForFBX").append($(AdvancedControlWindow.HTMLcontent).clone().tabs())
                break

            default:
                throw new Error("Tried to create AdvancedControlWindow with unknown parameter \"" + this.type + "\"")
        }

    }

    /** Remplie la fenêtre de son contenu et associe les actions liés à chaque éléments de la fenêtre */
    launch() {
        let targetedCollection
        let windowID

        if (this.type === "bvh") {
            targetedCollection = this.player.bvhAnimationsArray
            windowID = "#advancedControlForBVH"
        } else if (this.type === "fbx") {
            targetedCollection = this.player.fbxAnimationsArray
            windowID = "#advancedControlForFBX"
        } else {
            throw new Error("unsupported type for launching advanced controls");
        }

        this.UUIDs.forEach((uuid) => {
            this.player.toggleObjectInListVisibility(uuid, true)
        })

        $("#speedRatioSelector").change((object) => {
            let newTimeScaleValue = object.target.valueAsNumber
            this.UUIDs.forEach((uuid) => targetedCollection.getByUUID(uuid).speedRatio = newTimeScaleValue)
        })

        this.UUIDs.forEach((uuid) => {
            let graphsHierarchyString = this._browseThroughSkeleton(targetedCollection.getByUUID(uuid), uuid)
            let displayHierarchyString = this._browseThroughSkeleton(targetedCollection.getByUUID(uuid), uuid, '<input type="checkbox" checked>')

            $("#advancedCtrl-graphs").append('<div class="CtrlList"><p class="title">' + targetedCollection.getByUUID(uuid).name + '</p>' + graphsHierarchyString + '</div>')
            //$("#advancedCtrl-selection").append('<div class="CtrlList"><p class="title">' + targetedCollection.getByUUID(uuid).name + '</p>' + displayHierarchyString + '</div>')
        })

        $("#advancedCtrl-rendering #renderModeWireFrame").on("click", _ => { 
            this.UUIDs.forEach((uuid) => targetedCollection.getByUUID(uuid).wireframe = true)
        })
        $("#advancedCtrl-rendering #renderModeCubic").on("click", _ => { 
            this.UUIDs.forEach((uuid) => targetedCollection.getByUUID(uuid).wireframe = false)
        })
        $("#advancedCtrl-rendering #renderModeNode").on("click", _ => { 
            this.UUIDs.forEach((uuid) => targetedCollection.getByUUID(uuid).skeletonHelper = true)
        })

        $("#advancedCtrl-rendering #orthoEnabled").on("click", (event) => {
            let isEnabled = $(event.target).is(":checked")
            if (this.type == "bvh") {
                this.UUIDs.forEach((uuid) => targetedCollection.getByUUID(uuid).skeleton.bones.forEach(elem => elem.axis.visible = isEnabled))
            } else if (this.type == "fbx") {
                this.UUIDs.forEach((uuid) => targetedCollection.getByUUID(uuid).clip._root.children[0].traverse(elem => {
                    if(elem.type == "Bone") elem.axis.visible = isEnabled
                }))
            }
        })

        $("#advancedCtrl-graphs .CtrlList div").on("dblclick", (event) => {
            let nodeName = event.target.textContent
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
            if (nodeName === "Hips" || nodeName === "ROOT") {
                Plotly.react($("#nodeGraph")[0], this._translationGraphData(targetUUID, targetedCollection));
            } else {
                Plotly.react($("#nodeGraph")[0], this._rotationGraphData(nodeName, targetUUID, targetedCollection));
            }
        })

        /*$("#advancedCtrl-selection .CtrlList input").on("click", event =>{
            console.log(event.target.parentNode)
            let uuid = event.target.parentNode.attributes["data-uuid"].nodeValue
            let nodeName = event.target.parentNode.firstChild.innerText
            let isChecked = event.target.checked
            console.log(uuid)
            targetedCollection.getByUUID(uuid).clip._root.children[0].traverse(elem => {
                if(nodeName == elem.name) elem.visible = isChecked
            })
        })*/

        $(windowID).dialog({
            height: 480,
            width: 640,
            close: (event, ui) => {
                this.UUIDs.forEach((uuid) => {
                    $("#" + uuid).css("background-color", "white")
                })
                $(windowID).empty()
                $(windowID).remove()
                targetedCollection.highlightElements()
            }
        })
    }

    /** Parse le skelette et fourni une liste de listes HTML correspondant au squelette (sous forme de string)
     * 
     *  @param {Object3D} object_ squelette pour un bvh ou le root pour un fbx
     *  @param {UUID}
     *  @param {String} additionalTag_ Balise supplémentaire optionnelle
     * 
     *  @returns {String} le squelette sous forme de liste de liste HTML
     */
    _browseThroughSkeleton(object_, uuid_, additionalTag_ = "") {
        let recursiveNavigationForBVH = (object) => {
            let result = ""
            object.children.forEach((obj) => {
                if (obj.name != "ENDSITE"){
                    if (obj.children.length > 0) result = result + '<li><div data-uuid="' + uuid_ + '"><p>' + obj.name + "</p>" + additionalTag_ + "</div><ul>" + recursiveNavigationForBVH(obj) + "</ul>" + "</li>"
                }
            })
            return result
        }
        let recursiveNavigationForFBX = (object) => {
            let result = ""
            object.children.forEach((obj) => {
                if (obj.children.length == 0) result = result + '<li><div data-uuid="' + uuid_ + '"><p>' + obj.name + "</p>" + additionalTag_ + "</div></li>"
                else result = result + '<li><div data-uuid="' + uuid_ + '"><p>' + obj.name + "</p>" + additionalTag_ + "</div><ul>" + recursiveNavigationForFBX(obj) + "</ul>" + "</li>"
            })
            return result
        }

        if (this.type === "bvh") {
            return '<div data-uuid="' + uuid_ + '"><p>Hips</p>' + additionalTag_ + '</div><ul>' + recursiveNavigationForBVH(object_.skeleton.bones[0]) + "</ul>"
        } else if (this.type === "fbx") {
            return '<div data-uuid="' + uuid_ + '"><p>ROOT</p>' + additionalTag_ + '</div><ul>' + recursiveNavigationForFBX(object_.clip._root.children[0]) + "</ul>"
        }

    }

    /** Renvoie le graph des translations X Y Z de la node "Hips" du BVH correspondant au UUID donné, exploitable par plotly.js
     * 
     *  @param {UUID} targetUUID_ Le UUID de la cible
     *  @param {Array} targetedCollection_ La collection où se trouve l'animation
     */
    _translationGraphData(targetUUID_, targetedCollection_) {
        let graphData = [...targetedCollection_.getByUUID(targetUUID_).clip._actions[0]._clip.tracks[0].values.values()]
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
     *  @param {Array} targetedCollection_ La collection où se trouve l'animation
     */
    _rotationGraphData(nodeName_, targetUUID_, targetedCollection_) {

        let nameInClipIfBVH = ".bones[" + nodeName_ + "].quaternion"
        let nameInClipIfFBX = nodeName_ + ".quaternion"
        let graphData = targetedCollection_.getByUUID(targetUUID_).clip._actions[0]._clip.tracks.filter((elem) => elem.name == nameInClipIfBVH || elem.name == nameInClipIfFBX).flatMap((elem) => [...elem.values.values()])
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