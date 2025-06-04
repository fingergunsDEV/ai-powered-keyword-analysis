// This file is now the entry point that imports and initializes other modules
import * as d3 from 'd3';
import { setupEventListeners } from './eventHandlers.js';
import { initializeDOMReferences } from './domUtils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM references
    const elements = initializeDOMReferences();
    
    // Setup event listeners
    setupEventListeners(elements);
});
