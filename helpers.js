function addNode(response, edge) {
    layerCount++;
    var nodeObj = {
        group: "nodes",
        data: {
            id: response.imdb_id,
            tmdb_id: response.id,
            name: response.name.replace(/\s+/g, " "),
            films: response.movie_credits.cast,
            hitCount: 1
        },
        position: { x: (screen.width)/2, y: (screen.height)/2}
    };
    cy.add(nodeObj); //add to graph obj
    crossCheckNode(nodeObj); //check new node with all other nodes
    setLayout(); //update layout
    if(edge != undefined) {
        addEdge(edge.id, edge.tmdb_id, edge.name, edge.source, edge.target); //add related edge if not duplicate
        cleanGraph(); //clean extraneous values
    }
    //actorsArray.push(nodeObj);
    if(layerCount < layerScale) {
        getConnectingFilm(response); //get film from node
    } else {
        updateSub(); //on end
    }
}

function addEdge(id, tmdb_id, name, source, dest) {
    if(cy.getElementById(id) == undefined) {
        return;
    }
    try {
        cy.add({
            group: "edges",
            data: {id: id, tmdb_id: tmdb_id, name: name, source: source, target: dest}
        }); //add to graph obj
    } catch (e){}
}

function addRootNode(id) {
    $.ajax({
        url: "https://api.themoviedb.org/3/person/" + id + "?api_key=b16adb5f19440fe3c0a37959172ad70b&append_to_response=movie_credits",
        crossDomain: true,
        dataType: 'jsonp',
        success: function(response) {
            addNode(response, undefined);
        },
        error: function (response) {
            if(response.status == 404) {
                console.log(response);
            }
            alert("Due to a limitation of 40 requests per 10 seconds on the current API, please wait at least 10 seconds, refresh the page and try again.")
        }
    }); //make call to api for info
}

function getConnectingFilm(sourceActorResponse) {
    //given actor obj, get connecting edge film(s) and actor for each film
    for(var i = 0; i < filmsPerActor; i++) {
        var filmNum;
        //choose which films based on options
        if (filmMethod == "random") {
            filmNum = Math.floor(Math.random() * sourceActorResponse.movie_credits.cast.length);
        } else if (filmMethod == "old") {
            filmNum = i;
        } else if (filmMethod == "new") {
            filmNum = sourceActorResponse.movie_credits.cast.length - i - 1;
        }

        var filmID = sourceActorResponse.movie_credits.cast[filmNum].id; //get unique id from url
        if(pendingReqs > maxReqs) {
            nextPass.push({
                func: getConnectingFilm,
                param1: sourceActorResponse,
                param2: undefined,
                param3: undefined
            });
            return;
        } else {
            pendingReqs++;
        }
        try {
            $.ajax({
                url: "https://api.themoviedb.org/3/movie/" + filmID + "?api_key=b16adb5f19440fe3c0a37959172ad70b&append_to_response=credits",
                crossDomain: true,
                dataType: 'jsonp',
                success: function (response) {
                    chooseActor(sourceActorResponse, response)
                }
            }); //get info about film
        } catch (e) {
            nextPass.push({
                func: getConnectingFilm,
                param1: sourceActorResponse,
                param2: undefined,
                param3: undefined
            });
            return;
        }
    }
}

function chooseActor(sourceActorResponse, filmResponse) {
    //pick new actor from film, get data, create node and edge
    var newActor;
    var lower, higher, selected;
    //get method for selection based on options
    if(actorChoiceStyle == "random") {
        newActor = filmResponse.credits.cast[Math.floor((filmResponse.credits.cast.length*Math.random()))];
    } else if(actorChoiceStyle == "low") {
        lower = filmResponse.credits.cast.length - 1;
        higher = (filmResponse.credits.cast.length - 1) * 0.9;
        selected = Math.round(Math.random() * (higher - lower) + lower);
        newActor = filmResponse.credits.cast[selected];
    } else if(actorChoiceStyle == "high") {
        lower = (filmResponse.credits.cast.length - 1) * 0.1;
        higher = 0;
        selected = Math.round(Math.random() * (higher - lower) + lower);
        newActor = filmResponse.credits.cast[selected];
    }
    try {
        if (sourceActorResponse.name == newActor.name) {
            chooseActor(sourceActorResponse, filmResponse); //if same actor as source
            return;
        }
    } catch (e) {}
    if(newActor == undefined || newActor == null) {
        return; //if bad response
    }
    //newActor = newActor.replace(/\s+/g, ''); //format for reverse search
    //getResourceIdByName(newActor, sourceActorResponse, filmResponse);

    getNewActorData(newActor.id, sourceActorResponse, filmResponse)
}

function getNewActorData(newActorID, sourceActorResponse, filmResponse) {
    //return;
    if(pendingReqs > maxReqs) {
        nextPass.push({
            func: getNewActorData,
            param1: newActorID,
            param2: sourceActorResponse,
            param3: filmResponse
        });
        return;
    } else {
        pendingReqs++;
    }
    $.ajax({
        url: "https://api.themoviedb.org/3/person/" + newActorID + "?api_key=b16adb5f19440fe3c0a37959172ad70b&append_to_response=movie_credits",
        crossDomain: true,
        dataType: 'jsonp',
        success: function(response) {
            if(sourceActorResponse.id == response.id) {
                cy.getElementById(response.id).hitCount += 1;
            } else {
                try {
                    addNewNodeAndEdge(response, sourceActorResponse, filmResponse);
                } catch (e) {
                    nextPass.push({
                        func: getNewActorData,
                        param1: newActorID,
                        param2: sourceActorResponse,
                        param3: filmResponse
                    });
                    return;
                }
            }
        }
    })
}

function addNewNodeAndEdge(newActorResponse, sourceActorResponse, filmResponse) {
    var edgeObj = {
        id: filmResponse.imdb_id,
        tmdb_id: filmResponse.id,
        name: filmResponse.title,
        source: sourceActorResponse.imdb_id,
        target: newActorResponse.imdb_id
    }; //set up edge obj to be added
    addNode(newActorResponse, edgeObj);
}

function updateSub() {
    $('#go').prop('disabled', $.active > 1);
}

function cleanGraph() {
    for(var i = 0; i < rootNodes.length; i++) {
        if(cy.elements("node[[degree = 0]][tmdb_id = "+rootNodes[i]+"]").length > 0) {
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
        var filtered = [];
        for(var x = 0; x < eFilms.length; x++) {
            for(var y = 0; y < nFilms.length; y++) {
                if(eFilms[x].id == nFilms[y].id) {
                    filtered.push(eFilms[x]);
                }
            }
        }
        if(filtered.length != 0) {
            for (var i = 0; i < filtered.length; i++) {
                var tempEdge = filtered[i].id;
                var tempNode1 = nodeObj.data.id;
                var tempName = filtered[i].title;
                var tempNode2 = ele._private.data.id;
                if (cy.elements("edge[source = \'" + tempNode1 + "\'][dest = \'" + tempNode2 + "\']").length == 0 && cy.elements("edge[source = \'" + tempNode2 + "\'][dest = \'" + tempNode1 + "\']").length == 0) {
                    //if edge doesn't exist already
                    try {
                        addEdge("tt"+tempEdge, tempEdge, tempName, tempNode1, tempNode2);
                        return;
                    } catch (e) {
                        console.log("error adding edge")
                    }
                }
            }
        }
    });
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
