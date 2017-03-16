function construct() {
    rootNodes = $.map($('#initialValues')[0].value.split(','), $.trim);
    filmsPerActor = $('#edgeNum')[0].value;
    layerScale = $('#scaleNum')[0].value;
    filmMethod = $('input[name="filmChoice"]:checked').val();
    setLayout();
    for(var n = 0; n < rootNodes.length; n++) {
        addRootNodes(rootNodes[n]);
    }
    cy.on('tap', 'node', function (evt) {
        console.log(evt.cyTarget.id()); //TODO: add qtip here
        lastSelected = evt.cyTarget.id();
        //var win = window.open("http://www.imdb.com/name/" + evt.cyTarget.id() + "/");
    });
    cy.on('tap', 'edge', function (evt) {
        console.log(evt.cyTarget.id()); //TODO: add qtip here
        var win = window.open("http://www.imdb.com/title/" + evt.cyTarget.id() + "/");
    });

}