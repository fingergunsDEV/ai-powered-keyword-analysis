// Simple word tokenizer implementation
const simpleTokenizer = {
    tokenize: (text) => text.toLowerCase().split(/\W+/).filter(token => token.length > 0)
};

// Simple TF-IDF implementation
class SimpleTfIdf {
    constructor() {
        this.documents = [];
        this.documentCount = 0;
    }
    
    addDocument(tokens) {
        const termFreq = {};
        tokens.forEach(token => {
            termFreq[token] = (termFreq[token] || 0) + 1;
        });
        this.documents.push(termFreq);
        this.documentCount++;
    }
}

// Replace TF-IDF setup
const tokenizer = simpleTokenizer;

/**
 * Generate keyword clusters using NLP techniques
 */
export async function generateClusters(keywords, threshold, maxClusters, useSERP, useIntent) {
    // Create TF-IDF model
    const tfidf = new SimpleTfIdf();
    
    // Add all keywords to the model
    keywords.forEach(keyword => {
        tfidf.addDocument(tokenizer.tokenize(keyword.text.toLowerCase()));
    });
    
    // Calculate similarity matrix
    const similarityMatrix = [];
    for (let i = 0; i < keywords.length; i++) {
        similarityMatrix[i] = [];
        for (let j = 0; j < keywords.length; j++) {
            if (i === j) {
                similarityMatrix[i][j] = 1; // Self-similarity is 1
            } else {
                // Calculate similarity based on TF-IDF vectors
                const similarity = calculateSimilarity(keywords[i].text, keywords[j].text, tfidf);
                
                // If options are enabled, combine with mock SERP and intent data
                let finalSimilarity = similarity;
                if (useSERP) {
                    finalSimilarity = finalSimilarity * 0.7 + mockSERPOverlap(keywords[i].text, keywords[j].text) * 0.3;
                }
                if (useIntent) {
                    finalSimilarity = finalSimilarity * 0.8 + mockIntentSimilarity(keywords[i].text, keywords[j].text) * 0.2;
                }
                
                similarityMatrix[i][j] = finalSimilarity;
            }
        }
    }
    
    // Use hierarchical clustering
    const clusters = [];
    const assigned = new Set();
    
    // Start with each keyword in its own cluster
    const singleClusters = keywords.map((keyword, index) => ({
        index,
        keywords: [keyword]
    }));
    
    // Merge clusters until we reach the desired number
    while (singleClusters.length > Math.min(maxClusters, Math.ceil(keywords.length / 2))) {
        let maxSimilarity = -1;
        let mergeI = -1, mergeJ = -1;
        
        // Find the two most similar clusters
        for (let i = 0; i < singleClusters.length; i++) {
            for (let j = i + 1; j < singleClusters.length; j++) {
                const clusterI = singleClusters[i];
                const clusterJ = singleClusters[j];
                
                // Calculate average similarity between clusters
                let totalSimilarity = 0;
                let pairCount = 0;
                
                for (const kw1 of clusterI.keywords) {
                    for (const kw2 of clusterJ.keywords) {
                        totalSimilarity += similarityMatrix[kw1.index || 0][kw2.index || 0];
                        pairCount++;
                    }
                }
                
                const avgSimilarity = totalSimilarity / pairCount;
                
                if (avgSimilarity > maxSimilarity && avgSimilarity >= threshold) {
                    maxSimilarity = avgSimilarity;
                    mergeI = i;
                    mergeJ = j;
                }
            }
        }
        
        // If no clusters to merge, break
        if (mergeI === -1 || maxSimilarity < threshold) {
            break;
        }
        
        // Merge the clusters
        const newCluster = {
            keywords: [
                ...singleClusters[mergeI].keywords,
                ...singleClusters[mergeJ].keywords
            ]
        };
        
        // Remove the merged clusters and add the new one
        singleClusters.splice(Math.max(mergeI, mergeJ), 1);
        singleClusters.splice(Math.min(mergeI, mergeJ), 1);
        singleClusters.push(newCluster);
    }
    
    // Format clusters for visualization
    return singleClusters.map((cluster, index) => {
        const keywords = cluster.keywords.map(k => k.text || k);
        
        // Find primary keyword (for demo, using the shortest one)
        const primaryKeyword = findPrimaryKeyword(keywords);
        
        return {
            id: index + 1,
            name: `Cluster ${index + 1}`,
            primaryKeyword,
            secondaryKeywords: keywords.filter(k => k !== primaryKeyword),
            allKeywords: keywords
        };
    });
}

/**
 * Calculate similarity between two keywords
 */
function calculateSimilarity(keyword1, keyword2, tfidf) {
    const tokens1 = tokenizer.tokenize(keyword1.toLowerCase());
    const tokens2 = tokenizer.tokenize(keyword2.toLowerCase());
    
    // Count common tokens
    const common = tokens1.filter(token => tokens2.includes(token)).length;
    
    // Jaccard similarity
    const union = new Set([...tokens1, ...tokens2]).size;
    return union === 0 ? 0 : common / union;
}

/**
 * Mock SERP overlap (in a real implementation, this would use API data)
 */
function mockSERPOverlap(keyword1, keyword2) {
    // Simulate SERP overlap based on keywords
    const similarity = Math.random() * 0.5 + 0.2; // Random value between 0.2 and 0.7
    
    // Increase similarity for obviously related terms
    if (keyword1.includes(keyword2) || keyword2.includes(keyword1)) {
        return Math.min(similarity + 0.3, 1);
    }
    
    return similarity;
}

/**
 * Mock intent similarity (in a real implementation, this would use ML models)
 */
function mockIntentSimilarity(keyword1, keyword2) {
    // Simple intent classification based on common words
    const intents = {
        'how': 'informational',
        'what': 'informational',
        'why': 'informational',
        'when': 'informational',
        'best': 'commercial',
        'buy': 'transactional',
        'purchase': 'transactional',
        'shop': 'transactional',
        'price': 'transactional',
        'vs': 'commercial',
        'compare': 'commercial',
        'review': 'commercial'
    };
    
    // Check if keywords share intent signals
    let intent1 = 'navigational'; // default
    let intent2 = 'navigational'; // default
    
    for (const [signal, intent] of Object.entries(intents)) {
        if (keyword1.toLowerCase().includes(signal)) {
            intent1 = intent;
        }
        if (keyword2.toLowerCase().includes(signal)) {
            intent2 = intent;
        }
    }
    
    return intent1 === intent2 ? 0.8 : 0.2;
}

/**
 * Find the primary keyword in a cluster
 */
function findPrimaryKeyword(keywords) {
    // In a real implementation, this would use search volume and other metrics
    // For demo, use the shortest one as the primary
    return keywords.reduce((a, b) => a.length <= b.length ? a : b);
}
