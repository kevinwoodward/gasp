function addNode(response, edge) {
    layerCount++;
    var nodeObj = {
        group: "nodes",
        data: {
            id: response.data.id,
            name: response.data.title.replace(/\s+/g, " "),
            films: response.data.filmography,
            hitCount: 1
        },
        position: { x: (screen.width)/2, y: (screen.height)/2}
    };
    cy.add(nodeObj); //add to graph obj
    crossCheckNode(nodeObj); //check new node with all other nodes
    setLayout(); //update layout
    if(edge != undefined) {
        addEdge(edge.id, edge.name, edge.source, edge.target); //add related edge if not duplicate
        cleanGraph(); //clean extraneous values
    }
    //actorsArray.push(nodeObj);
    if(layerCount < layerScale) {
        getConnectingFilm(response); //get film from node
    } else {
        updateSub(); //on end
    }
}

function addEdge(id, name, source, dest) {
    if(cy.getElementById(id) == undefined) {
        return;
    }
    try {
        cy.add({
            group: "edges",
            data: {id: id, name: name, source: source, target: dest}
        }); //add to graph obj
    } catch (e){}
}

function addRootNode(id) {
    $.ajax({
        url: 'http://imdb.wemakesites.net/api/' + id,
        crossDomain: true,
        data: {
            api_key: 'c8a65916-b48d-4d3a-bcac-5641c93337f2'
        },
        dataType: 'jsonp',
        success: function(response) {
            addNode(response, undefined);
        }
    }); //make call to api for info
}

function getConnectingFilm(sourceActorResponse) {
    //given actor obj, get connecting edge film(s) and actor for each film
    for(var i = 0; i < filmsPerActor; i++) {
        var filmNum;
        //choose which films based on options
        if (filmMethod == "random") {
            filmNum = Math.round(Math.random() * sourceActorResponse.data.filmography.length);
        } else if (filmMethod == "new") {
            filmNum = i;
        } else if (filmMethod == "old") {
            filmNum = sourceActorResponse.data.filmography.length - i - 1;
        }

        var filmID = sourceActorResponse.data.filmography[filmNum].info.split("/")[4]; //get unique id from url
        $.ajax({
            url: 'http://imdb.wemakesites.net/api/' + filmID,
            crossDomain: true,
            data: {
                api_key: 'c8a65916-b48d-4d3a-bcac-5641c93337f2'
            },
            dataType: 'jsonp',
            success: function(response) {
                //TODO:pass film data and source actor to function to find an actor. Create actor node and edge between source actor and new actor.
                chooseActor(sourceActorResponse, response)
            }
        }); //get info about film
    }
}

function chooseActor(sourceActorResponse, filmResponse) {
    //pick new actor from film, get data, create node and edge
    var newActor;
    var lower, higher, selected;
    //get method for selection based on options
    if(actorChoiceStyle == "random") {
        newActor = filmResponse.data.cast[Math.round((filmResponse.data.cast.length*Math.random()))];
    } else if(actorChoiceStyle == "low") {
        lower = filmResponse.data.cast.length - 1;
        higher = (filmResponse.data.cast.length - 1) * 0.9;
        selected = Math.round(Math.random() * (higher - lower) + lower);
        newActor = filmResponse.data.cast[selected];
    } else if(actorChoiceStyle == "high") {
        lower = (filmResponse.data.cast.length - 1) * 0.1;
        higher = 0;
        selected = Math.round(Math.random() * (higher - lower) + lower);
        newActor = filmResponse.data.cast[selected];
    }
    if(sourceActorResponse.data.title == newActor) {
        chooseActor(sourceActorResponse, filmResponse); //if same actor as source
        return;
    }
    if(newActor == undefined || newActor == null) {
        return; //if bad response
    }
    newActor = newActor.replace(/\s+/g, ''); //format for reverse search
    getResourceIdByName(newActor, sourceActorResponse, filmResponse);


}

function getResourceIdByName(newActor, sourceActorResponse, filmResponse) {
    $.ajax({
        url: "http://imdb.wemakesites.net/api/search?="
        ,
        data: {
            api_key: 'c8a65916-b48d-4d3a-bcac-5641c93337f2',
            q: newActor
        },
        crossDomain: true,
        dataType: "jsonp",
        success: function(response) {
            //essentially do a search by name, choose result with exact name searched.
            var names = response.data.results.names;
            for(var i = 0; i < names.length; i++) {
                if(names[i].title.trim().toUpperCase().replace(/\s+/g, '') == newActor.trim().toUpperCase().replace(/\s+/g, '')) {
                    getNewActorData(names[i].id, sourceActorResponse, filmResponse);
                    break;
                }
            }
        }
    });
}

function getNewActorData(newActorID, sourceActorResponse, filmResponse) {
    $.ajax({
        url: 'http://imdb.wemakesites.net/api/' + newActorID,
        crossDomain: true,
        data: {
            api_key: 'c8a65916-b48d-4d3a-bcac-5641c93337f2'
        },
        dataType: 'jsonp',
        success: function(response) {
            if(sourceActorResponse.data.id == response.data.id) {
                cy.getElementById(response.data.id).hitCount += 1;
            } else {
                try {
                    addNewNodeAndEdge(response, sourceActorResponse, filmResponse);
                } catch (e) {}
            }
        }
    })
}

function addNewNodeAndEdge(newActorResponse, sourceActorResponse, filmResponse) {
    var edgeObj = {
        id: filmResponse.data.id,
        name: filmResponse.data.title,
        source: sourceActorResponse.data.id,
        target: newActorResponse.data.id
    }; //set up edge obj to be added
    addNode(newActorResponse, edgeObj);
}

function updateSub() {
    $('#go').prop('disabled', $.active > 1);
}

function cleanGraph() {
    for(var i = 0; i < rootNodes.length; i++) {
        if(cy.elements("node[[degree = 0]][id = \'"+rootNodes[i]+"\']").length > 0) {
            //if any root nodes have degree 0, return
            return;
        }
    }
    cy.remove(cy.elements("node[[degree = 0]]")); //else remove nodes deg 0
}

function crossCheckNode(nodeObj) {
    cy.nodes().forEach(function( ele ){
        if(ele._private.data.id == nodeObj.data.id){
            return true; //allows handler to iterate to next node
        }
        var eFilms = ele._private.data.films; //films for iterating node
        var nFilms = nodeObj.data.films; //films for passed node
        var DeFilms = decomposeObjArray(eFilms); //make array of objs into array of strings for array intersection calc
        var DnFilms = decomposeObjArray(nFilms); //make array of objs into array of strings for array intersection calc
        var filtered = DeFilms.filter(function(n) {
            return DnFilms.indexOf(n) !== -1; //intersection of both arrays
        });
        if(filtered.length != 0) {
            for (var i = 0; i < filtered.length; i++) {
                var tempEdge = filtered[i].split("/")[4];
                var tempNode1 = nodeObj.data.id;
                var tempNode2 = ele._private.data.id;
                if (cy.elements("edge[id = \'" + tempEdge+ "\'][source = \'" + tempNode1 + "\'][dest = \'" + tempNode2 + "\']") && cy.elements("edge[id = \'" + tempEdge+ "\'][source = \'" + tempNode2 + "\'][dest = \'" + tempNode1 + "\']")) {
                    //if edge doesn't exist already
                    try {
                        addEdge(tempEdge, null, tempNode1, tempNode2);
                    } catch (e) {}
                }
            }
        }
    });
}

function decomposeObjArray(arr) {
    var ret = [];
    for(var i = 0; i < arr.length; i++) {
        ret.push(arr[i].info);
    }
    return ret;
}

function recenter() {
    setLayout(); //reconfigures nodes
    cy.fit(cy.elements()); //fit to viewport
}

function chooseLock(val) {
    if(val == "drag") {
        cy.autolock(false);
    } else {
        cy.autolock(true);
    }
}

/*function parseInitialInputs(num) {
    //goal: root nodes from actor name to tag.

    //for(var i = 0; i < rootNodes.length; i++) {
        var temp = rootNodes[num];
        $.ajax({
            url: "http://imdb.wemakesites.net/api/search?="
            ,
            data: {
                api_key: 'c8a65916-b48d-4d3a-bcac-5641c93337f2',
                q: temp
            },
            crossDomain: true,
            dataType: "jsonp",
            success: function(response) {
                console.log("success for " + temp);
                var names = response.data.results.names;
                for(var j = 0; j < names.length; j++) {
                    console.log(temp);
                    console.log(names[j].title);
                    if(names[j].title.trim().toUpperCase().replace(/\s+/g, '') == temp) {
                        temp = names[j].id;
                        if(rootNodes.indexOf(temp)+1 < rootNodes.length){
                            parseInitialInputs(rootNodes.indexOf(temp)+1);
                        }
                        addRootNode(temp);
                        console.log("changing a name");
                        break;
                    }
                }
            }
        });
    //}
}*/
