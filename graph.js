var cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [],

    style: [ // the stylesheet for the graph
        {
            selector: 'node',
            style: {
                'background-color': '#000',
                'label': 'data(id)'
            }
        },

        {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#666',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle'
            }
        }
    ],

    layout: {
        name: 'breadthfirst',
        animate: true
    }
});