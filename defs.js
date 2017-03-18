var layerScale;
var layerCount = 0;
var filmsPerActor; //expansion edges per node
var filmMethod;
var rootNodes;
var lastSelected;
var animateGraph;

function setLayout() {
    animateGraph = $("#animate").is(':checked');
    var options;
    switch ($('input[name="gLayout"]:checked').val()) {
        case "concentric" :
            options = {
                name: 'concentric',

                fit: false, // whether to fit the viewport to the graph
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
                animate: animateGraph, // whether to transition the node positions
                animationDuration: 500, // duration of animation in ms if enabled
                animationEasing: undefined, // easing of animation if enabled
                ready: undefined, // callback on layoutready
                stop: undefined // callback on layoutstop
            };
            break;

        case "circular" :
            options = {
                name: 'circle',

                fit: false, // whether to fit the viewport to the graph
                padding: 30, // the padding on fit
                boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
                avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
                radius: undefined, // the radius of the circle
                startAngle: 3 / 2 * Math.PI, // where nodes start in radians
                sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
                clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
                sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
                animate: animateGraph, // whether to transition the node positions
                animationDuration: 500, // duration of animation in ms if enabled
                animationEasing: undefined, // easing of animation if enabled
                ready: undefined, // callback on layoutready
                stop: undefined // callback on layoutstop
            };
            break;

        case "grid":
            options = {
                name: 'grid',

                fit: false, // whether to fit the viewport to the graph
                padding: 30, // padding used on fit
                boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
                avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
                avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
                condense: false, // uses all available space on false, uses minimal space on true
                rows: undefined, // force num of rows in the grid
                cols: undefined, // force num of columns in the grid
                position: function( node ){}, // returns { row, col } for element
                sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
                animate: animateGraph, // whether to transition the node positions
                animationDuration: 500, // duration of animation in ms if enabled
                animationEasing: undefined, // easing of animation if enabled
                ready: undefined, // callback on layoutready
                stop: undefined // callback on layoutstop
            };
            break;

        case "breadthfirst":
            options = {
                name: 'breadthfirst',

                fit: false, // whether to fit the viewport to the graph
                directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
                padding: 30, // padding on fit
                circle: false, // put depths in concentric circles if true, put depths top down if false
                spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
                boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
                avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
                roots: undefined, // the roots of the trees
                maximalAdjustments: 0, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
                animate: animateGraph, // whether to transition the node positions
                animationDuration: 500, // duration of animation in ms if enabled
                animationEasing: undefined, // easing of animation if enabled
                ready: undefined, // callback on layoutready
                stop: undefined // callback on layoutstop
            };
            break;

    }

    cy.layout(options);
}