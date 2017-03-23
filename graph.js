
var cy = window.cy = cytoscape({
    container: document.getElementById('cy'),
    style: [ // the stylesheet for the graph
        {
            selector: 'node',
            style: {
                'background-color': '#000',
                'label': 'data(name)',
                'min-zoomed-font-size': '8'
            }
        },

        {
            selector: 'edge',
            style: {
                'content': 'data(name)',
                'width': 1,
                'line-color': '#666',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'text-wrap': 'wrap'
            }
        }
    ],

    elements: []

});


