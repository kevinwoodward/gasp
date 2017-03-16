//id is the unique value, so associated to nm0000115 tag.
function addNode(response, edge) {
    layerCount++;
    var nodeObj = {
        group: "nodes",
        data: {
            id: response.data.id,
            name: response.data.title.replace(/\s+/g, '_'),
            films: response.data.filmography,
            hitCount: 1
        },
        position: { x: (screen.width)/2, y: (screen.height)/2}
    };
    cy.add(nodeObj);
    if(edge != undefined) {
        addEdge(edge.id, edge.name, edge.source, edge.target);
        setLayout();
    }
    //actorsArray.push(nodeObj);
    if(layerCount < layerScale) {
        expandOnNode1(response);
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

var expandOnNode1 = function (sourceActorResponse) {
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
                    //return names[i];//TODO: instead of return names, continue doing stuff.
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
    console.log($.active);
    $('button').prop('disabled', $.active > 1);
}

function setLayout() {
    var options = {
        name: 'concentric',

        fit: true, // whether to fit the viewport to the graph
        padding: 30, // the padding on fit
        startAngle: 3 / 2 * Math.PI, // where nodes start in radians
        sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
        clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
        equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
        minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        height: undefined, // height of layout area (overrides container height)
        width: undefined, // width of layout area (overrides container width)
        concentric: function( node ){ // returns numeric value for each node, placing higher nodes in levels towards the centre
            return node.degree();
        },
        levelWidth: function( nodes ){ // the variation of concentric values in each level
            return nodes.maxDegree() / 4;
        },
        animate: true, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        ready: undefined, // callback on layoutready
        stop: undefined // callback on layoutstop
    };
    cy.layout(options);
}

