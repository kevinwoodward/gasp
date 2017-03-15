function addNode(id, tag, films, x, y) {
    cy.add({
        group: "nodes",
        data: { id: id, tag: tag, films: films},
        position: { x: x, y: y }
    });
}

function addEdge(id, tag, source, dest) {
    cy.add({
        group: "edges",
        data: {id: id, source: source, target: dest}
    });
}

function addFirstNode(tag) {
    $.ajax({
        url: 'http://imdb.wemakesites.net/api/' + tag,
        crossDomain: true,
        data: {
            api_key: 'c8a65916-b48d-4d3a-bcac-5641c93337f2'
        },
        dataType: 'jsonp',
        success: function(response) {
            console.log(response);
            addNode(
                response.data.title,
                response.data.id,
                response.data.filmography
            );
            //console.log(response.data.filmography[0].info.split("/")[4])
        }
    });
}

function expandOnNode(tag, prevActor) {
    $.ajax({
        url: 'http://imdb.wemakesites.net/api/' + tag,
        crossDomain: true,
        data: {
            api_key: 'c8a65916-b48d-4d3a-bcac-5641c93337f2'
        },
        dataType: 'jsonp',
        success: function(response) {
            console.log(response);
            if(response.data.type == "name") {
                addNode(
                    response.data.title,
                    response.data.id
                );
                addEdge(
                    response.data.filmography[1].title,
                    response.data.filmography[1].info.split("/")[4],
                    response.data.title,
                    prevActor
                );
            } else if(response.data.type == "title") {
                console.log("adding edge");
            }
            //console.log(response.data.filmography[0].info.split("/")[4])
        }
    });
}