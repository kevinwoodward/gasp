function construct() {
    if($.active != 0) {
        alert("Please wait for the current graph to complete, or refresh the page");
        return;
    }
    layerCount = 0;
    cy.remove(cy.elements()); //remove prev graph
    rootNodes = $.map($('#initialValues')[0].value.split(','), $.trim); //get a bunch of html fields
    filmsPerActor = $('#edgeNum')[0].value;
    layerScale = $('#scaleNum')[0].value;
    filmMethod = $('#filmChoice').val();
    actorChoiceStyle = $("#actorChoice").val();
    animateGraph = $("#animate").is(':checked');
    setLayout();
    for(var n = 0; n < rootNodes.length; n++) {
        addRootNode(rootNodes[n]); //start algorithm on each root
    }
    cy.autolock(true); //lock node dragging
    cy.on('tap', 'node', function (evt) {
        //on node click
        cy.nodes().style({"background-color" : "#000"});
        cy.edges().style({'line-color': '#666'});
        switch($("#nodeClick").val()) {
            case "link":
                window.open("http://www.imdb.com/name/" + evt.cyTarget.id() + "/");
                break;
            case "bfs":
                cy.elements().breadthFirstSearch(
                    {
                        root: evt.cyTarget,
                        visit: function (i, depth, v, e, u) {
                            //handler fxn for bfs
                            v.style({'background-color': colorScale[i % 20]});
                            if (e != undefined) {
                                e.style({'line-color': colorScale[i % 20]});
                            }
                        }
                    });
                break;

            case "drag":
                break;

            case "dfs":
                cy.elements().depthFirstSearch(
                    {
                        root: evt.cyTarget,
                        visit: function (i, depth, v, e, u) {
                            //handler fxn for dfs
                            v.style({'background-color': colorScale[i % 20]});
                            if (e != undefined) {
                                e.style({'line-color': colorScale[i % 20]});
                            }
                        }
                    });
                break;

            case "mincut":
                //for min cut
                //var hidden = cy.elements("node[[degree=1]]").remove();
                var cutObj = cy.elements().kargerStein();
                cutObj.cut.style({"line-color" : "#F00"});
                cutObj.partition1.style({"background-color" : "#0F0"});
                cutObj.partition2.style({"background-color" : "#00F"});
                //hidden.restore();
        }

    });
    cy.on('tap', 'edge', function (evt) {
        //open film page
        window.open("http://www.imdb.com/title/" + evt.cyTarget.id() + "/");
    });
}