var layerScale = 5;
var layerCount = 0;
var filmsPerActor = 10; //expansion edges per node
var filmMethod = "random";
var rootNodes = [
    "nm0000115",
    "nm0000434",
    "nm0597388",
    "nm0175834",
    "nm0010736"
];
function construct() {
    //FLOW: add actors(roots), {get n films per actor. For each film, add unique actor.} iterate on {}
    setLayout();
    for(var n = 0; n < rootNodes.length; n++) {
        addRootNodes(rootNodes[n]);
        layerCount = 0;
    }
    //cy.renderer().data.lyrTxrCache.invalidateElements(cy.elements);
    //cy.renderer().data. eleTxrCache.invalidateElement(cy.elements);
    //getResourceIdByName("nicolas cage");
}