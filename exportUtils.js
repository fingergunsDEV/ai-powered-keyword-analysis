/**
 * Export clusters to CSV
 */
export function exportToCSV(clusters) {
    if (!clusters.length) {
        alert('No data to export');
        return;
    }
    
    let csvContent = 'Cluster,Intent,Keyword Type,Keyword,Branded\n';
    
    clusters.forEach((cluster, index) => {
        const isBranded = cluster.primaryKeywordData ? 
            cluster.primaryKeywordData.isBranded : false;
            
        // Add primary keyword
        csvContent += `Cluster ${index + 1},${cluster.intent || 'N/A'},Primary,"${cluster.primaryKeyword}",${isBranded ? 'Yes' : 'No'}\n`;
        
        // Add secondary keywords
        if (cluster.secondaryKeywordsData) {
            cluster.secondaryKeywordsData.forEach(keyword => {
                csvContent += `Cluster ${index + 1},${keyword.intent || 'N/A'},Secondary,"${keyword.text}",${keyword.isBranded ? 'Yes' : 'No'}\n`;
            });
        } else {
            cluster.secondaryKeywords.forEach(keyword => {
                csvContent += `Cluster ${index + 1},N/A,Secondary,"${keyword}",No\n`;
            });
        }
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'keyword_clusters.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export to Google Sheets (simulated)
 */
export function exportToGoogleSheets(clusters) {
    alert('In a real Google Sheets Add-on, this would export directly to your sheet. This is a browser demo.');
}
