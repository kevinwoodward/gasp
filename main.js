function construct() {
    if($.active != 0) {
        alert("Please wait for the current graph to complete, or refresh the page");
        return;
    }
    layerCount = 0;
    cy.remove(cy.elements());
    rootNodes = $.map($('#initialValues')[0].value.split(','), $.trim);
    filmsPerActor = $('#edgeNum')[0].value;
    layerScale = $('#scaleNum')[0].value;
    filmMethod = $('#filmChoice').val();
    animateGraph = $("#animate").is(':checked');
    setLayout();
    for(var n = 0; n < rootNodes.length; n++) {
        addRootNode(rootNodes[n]);
    }
    cy.autolock(true);
    cy.on('tap', 'node', function (evt) {
        console.log("Degree centrality is: ");
        console.log(cy.elements().degreeCentrality({root:evt.cyTarget}));
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
                            v.style({'background-color': colorScale[i % 20]});
                            if (e != undefined) {
                                e.style({'line-color': colorScale[i % 20]});
                            }
                        }
                    });
                break;

            case "mincut":
                var cutObj = cy.elements().kargerStein();
                cutObj.cut.style({"line-color" : "#F00"});
                cutObj.partition1.style({"background-color" : "#0F0"});
                cutObj.partition2.style({"background-color" : "#00F"});
        }

    });
    cy.on('tap', 'edge', function (evt) {
        window.open("http://www.imdb.com/title/" + evt.cyTarget.id() + "/");
    });
}