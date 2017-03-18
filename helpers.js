//id is the unique value, so associated to nm0000115 tag.
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
    cy.add(nodeObj);
    crossCheckNode(nodeObj);
    setLayout();
    if(edge != undefined) {
        addEdge(edge.id, edge.name, edge.source, edge.target);
        cleanGraph();
    }
    //actorsArray.push(nodeObj);
    if(layerCount < layerScale) {
        getConnectingFilm(response);
    } else {
        updateSub();
        return;
    }
}

function addEdge(id, name, source, dest) {
    if(cy.getElementById(id) == undefined) {
        cy.getElementById(id).width += 10;
        return;
    }
    cy.add({
        group: "edges",
        data: {id: id, name: name, source: source, target: dest}
    });
}

function addRootNodes(id) {
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
    });
}

function getConnectingFilm(sourceActorResponse) {
    //TODO: given actor obj, get connecting edge film(s) and actor for each film
    for(var i = 0; i < filmsPerActor; i++) {
        var filmNum;
        //choose which films
        if (filmMethod == "random") {
            filmNum = Math.round(Math.random() * sourceActorResponse.data.filmography.length);
        } else if (filmMethod == "new") {
            filmNum = i;
        } else if (filmMethod == "old") {
            filmNum = sourceActorResponse.data.filmography.length - i - 1;
        }

        var filmID = sourceActorResponse.data.filmography[filmNum].info.split("/")[4]; //TODO: add logic for which films to pick.
        $.ajax({
            url: 'http://imdb.wemakesites.net/api/' + filmID,
            crossDomain: true,
            data: {
                api_key: 'c8a65916-b48d-4d3a-bcac-5641c93337f2'
            },
            dataType: 'jsonp',
            success: function(response) {
                //TODO:pass film data and source actor to function to find an actor. Create actor node and edge between source actor and new actor.
                expandOnNode2(sourceActorResponse, response)
            }
        })
    }
};

function expandOnNode2(sourceActorResponse, filmResponse) {
    //TODO: pick new actor from film, ajax get data, create node and edge
    var newActor = filmResponse.data.cast[Math.round((filmResponse.data.cast.length*Math.random()))]; //TODO: NOT 1!
    if(newActor == undefined || newActor == null) {
        return;
    }
    newActor = newActor.replace(/\s+/g, '');
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
                //console.log(response);

                try {
                    addNewNodeAndEdge(response, sourceActorResponse, filmResponse);
                } catch (e) {
                    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                    console.log(e);
                    console.log(response);
                    console.log("Most likely this is thrown due to a small filmography of this actor");
                    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                }
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
    };
    addNode(newActorResponse, edgeObj);

    //addEdge(filmResponse.data.id, filmResponse.data.title, sourceActorResponse.data.id, newActorResponse.data.id);
}

function updateSub() {
    $('#go').prop('disabled', $.active > 1);
}

function cleanGraph() {
    ////"node[[degree = 0]][id !*= "nm0000115nm0000434nm0000158"]"
    for(var i = 0; i < rootNodes.length; i++) {
        if(cy.elements("node[[degree = 0]][id = \'"+rootNodes[i]+"\']").length > 0) {
            return;
        }
    }
    cy.remove(cy.elements("node[[degree = 0]]"))
}

function crossCheckNode(nodeObj) {
    cy.nodes().forEach(function( ele ){
        if(ele._private.data.id == nodeObj.data.id){
            return true;
        }
        //console.log(ele._private.data.films);
        var eFilms = ele._private.data.films;
        var nFilms = nodeObj.data.films;
        var DeFilms = decomposeObjArray(eFilms);
        var DnFilms = decomposeObjArray(nFilms);
        var filtered = DeFilms.filter(function(n) {
            return DnFilms.indexOf(n) !== -1;
        });
        if(filtered.length != 0) {
            for (var i = 0; i < filtered.length; i++) {
                var tempEdge = filtered[i].split("/")[4];
                var tempNode1 = nodeObj.data.id;
                var tempNode2 = ele._private.data.id;
                if (cy.elements("edge[id = \'" + tempEdge+ "\'][source = \'" + tempNode1 + "\'][dest = \'" + tempNode2 + "\']") && cy.elements("edge[id = \'" + tempEdge+ "\'][source = \'" + tempNode2 + "\'][dest = \'" + tempNode1 + "\']")) {
                    try {
                        addEdge(tempEdge, null, tempNode1, tempNode2);
                    } catch (e) {
                        //TODO: handle e
                    }
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
    setLayout();
    cy.fit(cy.elements());
}

function getStats() {
    console.log(cy);
    console.log(JSON.stringify(cy._private));
}