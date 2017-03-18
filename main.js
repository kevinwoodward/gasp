function construct() {
    if($.active != 0) {
        alert("Please wait for the current graph to complete, or refresh the page");
        return;
    }
    layerCount = 0;
    cy.remove(cy.elements());
    console.log(cy);
    rootNodes = $.map($('#initialValues')[0].value.split(','), $.trim);
    filmsPerActor = $('#edgeNum')[0].value;
    layerScale = $('#scaleNum')[0].value;
    filmMethod = $('input[name="filmChoice"]:checked').val();
    animateGraph = $("#animate").is(':checked');
    setLayout();
    for(var n = 0; n < rootNodes.length; n++) {
        addRootNodes(rootNodes[n]);
    }
    cy.on('tap', 'node', function (evt) {
        console.log(evt.cyTarget.id()); //TODO: add qtip here
        lastSelected = evt.cyTarget.id();
        console.log("Degree centrality is: ");
        console.log(cy.elements().degreeCentrality({root:evt.cyTarget}));
        console.log("PageRank is: ");
        console.log(cy.elements().pageRank({root:evt.cyTarget}));
        //var win = window.open("http://www.imdb.com/name/" + evt.cyTarget.id() + "/");
    });
    cy.on('tap', 'edge', function (evt) {
        console.log(evt.cyTarget.id()); //TODO: add qtip here
        var win = window.open("http://www.imdb.com/title/" + evt.cyTarget.id() + "/");
    });
}