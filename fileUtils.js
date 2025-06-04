/**
 * Parse CSV file and update the keyword input
 */
export function parseCSV(file, keywordInput) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const lines = content.split('\n');
        const keywords = [];
        
        // Extract keywords from CSV
        for (let i = 1; i < lines.length; i++) { // Skip header
            const line = lines[i].trim();
            if (line) {
                const columns = line.split(',');
                if (columns.length > 0) {
                    keywords.push(columns[0].trim().replace(/"/g, ''));
                }
            }
        }
        
        // Update the textarea with the keywords
        keywordInput.value = keywords.join('\n');
    };
    reader.readAsText(file);
}

/**
 * Get keywords from input textarea
 */
export function getKeywords(keywordInput) {
    const text = keywordInput.value.trim();
    if (!text) return [];
    
    // Split by newline or comma
    if (text.includes('\n')) {
        return text.split('\n').map(k => k.trim()).filter(k => k);
    } else {
        return text.split(',').map(k => k.trim()).filter(k => k);
    }
}
