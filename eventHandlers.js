import { parseCSV, getKeywords } from './fileUtils.js';
import { generateClusters } from './clusteringEngine.js';
import { drawMindMap, drawTable } from './visualizations.js';
import { exportToCSV, exportToGoogleSheets } from './exportUtils.js';

// Application state
let keywordData = [];
let clusterResults = [];

/**
 * Set up all event listeners for the application
 */
export function setupEventListeners(elements) {
    // File upload handling
    elements.fileUpload.addEventListener('change', (event) => {
        handleFileUpload(event, elements);
    });
    
    // Threshold slider
    elements.thresholdSlider.addEventListener('input', () => {
        elements.thresholdValue.textContent = elements.thresholdSlider.value;
    });
    
    // Tab switching
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Update active tab button
            elements.tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active tab content
            elements.tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            
            // If switching to mindmap, redraw visualization
            if (tabName === 'mindmap' && clusterResults.length > 0) {
                drawMindMap(clusterResults, elements.visualization);
            }
        });
    });
    
    // Generate clusters button
    elements.clusterBtn.addEventListener('click', async () => {
        await handleClusterGeneration(elements);
    });
    
    // Export buttons
    elements.exportCSVBtn.addEventListener('click', () => exportToCSV(clusterResults));
    elements.exportGSheetsBtn.addEventListener('click', () => exportToGoogleSheets(clusterResults));
}

/**
 * Handle file upload event
 */
function handleFileUpload(event, elements) {
    const file = event.target.files[0];
    if (file) {
        elements.fileName.textContent = file.name;
        
        // Parse CSV or Excel
        if (file.name.endsWith('.csv')) {
            parseCSV(file, elements.keywordInput);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            alert('Excel parsing is not supported in this demo. Please use CSV format.');
            // In a real implementation, we would use a library like SheetJS
        }
    }
}

/**
 * Handle cluster generation logic
 */
async function handleClusterGeneration(elements) {
    // Get keywords from input
    const keywords = getKeywords(elements.keywordInput);
    if (keywords.length === 0) {
        alert('Please enter some keywords or upload a file');
        return;
    }
    
    // Show loading overlay
    elements.loadingOverlay.classList.remove('hidden');
    
    // Give the UI time to update before heavy processing
    setTimeout(async () => {
        try {
            // Process keywords
            keywordData = keywords.map(keyword => ({ text: keyword }));
            
            // Get clustering options
            const threshold = parseFloat(elements.thresholdSlider.value);
            const maxClusters = parseInt(elements.maxClustersInput.value);
            const useSERP = elements.useSERPCheckbox.checked;
            const useIntent = elements.useIntentCheckbox.checked;
            const groupByIntent = elements.groupByIntentCheckbox && elements.groupByIntentCheckbox.checked;
            
            // Generate clusters
            clusterResults = await generateClusters(
                keywordData, 
                threshold, 
                maxClusters, 
                useSERP, 
                useIntent || groupByIntent
            );
            
            // Update visualizations
            const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
            if (activeTab === 'mindmap') {
                drawMindMap(clusterResults, elements.visualization);
            } else {
                drawTable(clusterResults, elements.tableContainer);
            }
        } catch (error) {
            console.error('Error generating clusters:', error);
            alert('An error occurred while generating clusters.');
        } finally {
            // Hide loading overlay
            elements.loadingOverlay.classList.add('hidden');
        }
    }, 100);
}
