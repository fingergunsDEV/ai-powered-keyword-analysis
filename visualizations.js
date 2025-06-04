import * as d3 from 'd3';
import { wrapText } from './domUtils.js';

/**
 * Draw mind map visualization
 */
export function drawMindMap(clusters, visualizationElement) {
    visualizationElement.innerHTML = '';
    
    const width = visualizationElement.clientWidth;
    const height = visualizationElement.clientHeight;
    
    // Create SVG
    const svg = d3.select(visualizationElement)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);
    
    // Create root node
    const data = {
        name: 'Keyword Clusters',
        children: clusters.map(cluster => ({
            name: cluster.primaryKeyword,
            children: cluster.secondaryKeywords.map(keyword => ({ name: keyword }))
        }))
    };
    
    // Create hierarchy
    const root = d3.hierarchy(data);
    
    // Create cluster layout
    const radius = Math.min(width, height) / 2 - 60;
    const cluster = d3.cluster().size([360, radius]);
    
    // Apply layout
    cluster(root);
    
    // Draw links
    svg.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d => {
            return `M${project(d.source.x, d.source.y)}L${project(d.target.x, d.target.y)}`;
        })
        .style('fill', 'none')
        .style('stroke', '#ccc')
        .style('stroke-width', '1.5px');
    
    // Draw nodes
    const node = svg.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', d => `node ${d.children ? 'node--internal' : 'node--leaf'}`)
        .attr('transform', d => `translate(${project(d.x, d.y)})`);
    
    // Draw circles for nodes
    node.append('circle')
        .attr('r', d => d.depth === 0 ? 10 : d.depth === 1 ? 8 : 5)
        .style('fill', d => d.depth === 0 ? '#4285f4' : d.depth === 1 ? '#34a853' : '#fbbc05');
    
    // Add text labels
    node.append('text')
        .attr('dy', d => d.depth === 0 ? -15 : d.children ? -10 : 12)
        .style('text-anchor', 'middle')
        .style('font-size', d => d.depth === 0 ? '14px' : d.depth === 1 ? '12px' : '10px')
        .text(d => d.data.name)
        .style('fill', '#333')
        .each(function(d) {
            // Wrap text for long keywords
            wrapText(this, d.depth === 0 ? 120 : d.depth === 1 ? 100 : 80);
        });
    
    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.5, 5])
        .on('zoom', (event) => {
            svg.attr('transform', event.transform);
        });
    
    d3.select(`${visualizationElement.id} svg`).call(zoom);
    
    // Helper function to project positions
    function project(x, y) {
        const angle = (x - 90) / 180 * Math.PI;
        return [y * Math.cos(angle), y * Math.sin(angle)];
    }
}

/**
 * Draw table view of clusters
 */
export function drawTable(clusters, tableContainer) {
    tableContainer.innerHTML = '';
    
    // Create table
    const table = document.createElement('table');
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Cluster', 'Primary Keyword', 'Secondary Keywords', 'Total Keywords'];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    clusters.forEach((cluster, index) => {
        const row = document.createElement('tr');
        
        // Cluster number
        const clusterCell = document.createElement('td');
        clusterCell.textContent = `Cluster ${index + 1}`;
        clusterCell.classList.add('cluster-header');
        row.appendChild(clusterCell);
        
        // Primary keyword
        const primaryCell = document.createElement('td');
        primaryCell.textContent = cluster.primaryKeyword;
        primaryCell.style.fontWeight = 'bold';
        row.appendChild(primaryCell);
        
        // Secondary keywords
        const secondaryCell = document.createElement('td');
        secondaryCell.textContent = cluster.secondaryKeywords.join(', ');
        row.appendChild(secondaryCell);
        
        // Total keywords
        const totalCell = document.createElement('td');
        totalCell.textContent = cluster.allKeywords.length;
        row.appendChild(totalCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}
