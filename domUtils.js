// DOM utility functions for the application

/**
 * Initialize references to DOM elements
 * @returns {Object} Object containing references to DOM elements
 */
export function initializeDOMReferences() {
    return {
        keywordInput: document.getElementById('keywordInput'),
        fileUpload: document.getElementById('fileUpload'),
        fileName: document.getElementById('fileName'),
        clusterBtn: document.getElementById('clusterBtn'),
        thresholdSlider: document.getElementById('clusterThreshold'),
        thresholdValue: document.getElementById('thresholdValue'),
        maxClustersInput: document.getElementById('maxClusters'),
        useSERPCheckbox: document.getElementById('useSERP'),
        useIntentCheckbox: document.getElementById('useIntent'),
        groupByIntentCheckbox: document.getElementById('groupByIntent'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        tabButtons: document.querySelectorAll('.tab-btn'),
        tabPanes: document.querySelectorAll('.tab-pane'),
        exportCSVBtn: document.getElementById('exportCSV'),
        exportGSheetsBtn: document.getElementById('exportGSheets'),
        visualization: document.getElementById('visualization'),
        tableContainer: document.getElementById('tableContainer')
    };
}

/**
 * Helper function to wrap text in SVG
 */
export function wrapText(text, width) {
    const textElement = d3.select(text);
    const words = textElement.text().split(/\s+/).reverse();
    const lineHeight = 1.1;
    const y = textElement.attr('y');
    const dy = parseFloat(textElement.attr('dy') || 0);
    
    let line = [];
    let lineNumber = 0;
    let word;
    let tspan = textElement.text(null)
        .append('tspan')
        .attr('x', 0)
        .attr('y', y)
        .attr('dy', dy + 'em');
    
    while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(' '));
            line = [word];
            tspan = textElement.append('tspan')
                .attr('x', 0)
                .attr('y', y)
                .attr('dy', ++lineNumber * lineHeight + dy + 'em')
                .text(word);
        }
    }
}
