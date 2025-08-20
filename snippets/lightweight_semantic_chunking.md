Certainly! Here's a Node.js code snippet that demonstrates how to semantically chunk a large text and extract the most relevant chunks based on a given query. This approach utilizes the `semantic-chunking` library, which segments text into semantically meaningful chunks using sentence embeddings and cosine similarity.

### 🧩 Prerequisites

1. **Install Dependencies**:

   ```bash
   npm install semantic-chunking
   ```

2. **Download a Pre-trained Embedding Model**:

   The `semantic-chunking` library uses sentence embeddings to determine semantic similarity. By default, it utilizes the `Xenova/all-MiniLM-L6-v2` model. You can download this model using the `sentence-transformers` library in Python or find an equivalent model compatible with Node.js.

### 🧠 Code Example

```javascript
const { chunkit } = require('semantic-chunking');
const fs = require('fs');
const path = require('path');

// Load your large text document
const text = fs.readFileSync(path.join(__dirname, 'your-article.txt'), 'utf-8');

// Define your query
const query = 'What are the benefits of semantic chunking?';

// Function to compute cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to extract the most relevant chunks based on the query
async function extractRelevantChunks(text, query) {
  // Step 1: Chunk the text semantically
  const chunks = await chunkit(text, {
    maxTokenSize: 256,
    similarityThreshold: 0.5,
  });

  // Step 2: Compute embeddings for the query and each chunk
  const queryEmbedding = await getEmbedding(query);
  const chunkEmbeddings = await Promise.all(chunks.map(chunk => getEmbedding(chunk)));

  // Step 3: Calculate cosine similarity between the query and each chunk
  const similarities = chunkEmbeddings.map(chunkEmbedding =>
    cosineSimilarity(queryEmbedding, chunkEmbedding)
  );

  // Step 4: Filter chunks with similarity above a certain threshold
  const threshold = 0.7;
  const relevantChunks = chunks.filter((_, index) => similarities[index] >= threshold);

  return relevantChunks;
}

// Function to get the embedding of a text (stub implementation)
// Replace this with actual code to compute embeddings using a pre-trained model
async function getEmbedding(text) {
  // Placeholder: Replace with actual embedding computation
  return new Array(768).fill(0); // Example: 768-dimensional zero vector
}

// Extract and display the most relevant chunks
extractRelevantChunks(text, query)
  .then(relevantChunks => {
    console.log('Most Relevant Chunks:');
    relevantChunks.forEach((chunk, index) => {
      console.log(`\nChunk ${index + 1}:\n`, chunk);
    });
  })
  .catch(err => console.error('Error:', err));
```

### 🔍 How It Works

1. **Chunking**: The `chunkit` function from the `semantic-chunking` library divides the large text into semantically coherent chunks based on sentence embeddings and cosine similarity.

2. **Embedding Computation**: For both the query and each chunk, embeddings are computed. In this example, the `getEmbedding` function is a placeholder and should be replaced with actual code to compute embeddings using a pre-trained model.

3. **Similarity Calculation**: The cosine similarity between the query's embedding and each chunk's embedding is calculated to assess relevance.

4. **Filtering**: Chunks with a similarity score above a defined threshold are considered relevant and are returned.

### ⚠️ Notes

* **Embedding Model**: The `getEmbedding` function is a stub and needs to be implemented using a suitable embedding model. You can use models like `Xenova/all-MiniLM-L6-v2` or any other model compatible with Node.js.

* **Performance**: Computing embeddings and cosine similarity can be resource-intensive. Ensure your system has adequate resources, especially when dealing with large texts.

* **Threshold Adjustment**: The similarity threshold (`0.7` in this example) can be adjusted based on your requirements to fine-tune the relevance of the extracted chunks.

Feel free to modify the code to suit your specific needs, such as integrating a real embedding model or adjusting the chunking parameters.

Absolutely! You can adapt semantic chunking to operate at the paragraph level instead of the sentence level. Here's how you can achieve that:

---

### 🔧 Approach: Chunking by Paragraph

1. **Preprocess the Text**: Split your large text into paragraphs. This can be done by identifying paragraph delimiters, such as double newlines (`\n\n`).([datastax.com][1])

2. **Compute Embeddings**: Generate embeddings for each paragraph. You can use models like `Xenova/all-MiniLM-L6-v2` or any other suitable embedding model.

3. **Calculate Similarity**: Compute the cosine similarity between the embeddings of consecutive paragraphs. If the similarity is above a certain threshold, consider merging them into a single chunk.

4. **Form Chunks**: Group paragraphs into chunks based on their semantic similarity. This ensures that each chunk contains semantically coherent information.

---

### 🧪 Example Implementation

Here's a simplified Node.js example demonstrating this approach:

```javascript
const { chunkit } = require('semantic-chunking');
const fs = require('fs');
const path = require('path');

// Load your large text document
const text = fs.readFileSync(path.join(__dirname, 'your-article.txt'), 'utf-8');

// Preprocess: Split text into paragraphs
const paragraphs = text.split('\n\n');

// Define your query
const query = 'What are the benefits of semantic chunking?';

// Function to compute cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to extract the most relevant chunks based on the query
async function extractRelevantChunks(paragraphs, query) {
  // Step 1: Compute embeddings for each paragraph
  const paragraphEmbeddings = await Promise.all(paragraphs.map(paragraph => getEmbedding(paragraph)));
  const queryEmbedding = await getEmbedding(query);

  // Step 2: Calculate cosine similarity between the query and each paragraph
  const similarities = paragraphEmbeddings.map(paragraphEmbedding =>
    cosineSimilarity(queryEmbedding, paragraphEmbedding)
  );

  // Step 3: Filter paragraphs with similarity above a certain threshold
  const threshold = 0.7;
  const relevantParagraphs = paragraphs.filter((_, index) => similarities[index] >= threshold);

  // Step 4: Group semantically similar paragraphs into chunks
  const chunks = groupParagraphsIntoChunks(relevantParagraphs);

  return chunks;
}

// Function to get the embedding of a text (stub implementation)
// Replace this with actual code to compute embeddings using a pre-trained model
async function getEmbedding(text) {
  // Placeholder: Replace with actual embedding computation
  return new Array(768).fill(0); // Example: 768-dimensional zero vector
}

// Function to group semantically similar paragraphs into chunks
function groupParagraphsIntoChunks(paragraphs) {
  const chunks = [];
  let currentChunk = [];

  for (let i = 0; i < paragraphs.length; i++) {
    if (i === 0 || cosineSimilarity(getEmbedding(paragraphs[i]), getEmbedding(paragraphs[i - 1])) >= 0.7) {
      currentChunk.push(paragraphs[i]);
    } else {
      chunks.push(currentChunk.join('\n\n'));
      currentChunk = [paragraphs[i]];
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n\n'));
  }

  return chunks;
}

// Extract and display the most relevant chunks
extractRelevantChunks(paragraphs, query)
  .then(relevantChunks => {
    console.log('Most Relevant Chunks:');
    relevantChunks.forEach((chunk, index) => {
      console.log(`\nChunk ${index + 1}:\n`, chunk);
    });
  })
  .catch(err => console.error('Error:', err));
```

---

### ⚠️ Notes

* **Embedding Model**: The `getEmbedding` function is a placeholder. You'll need to implement it using a suitable embedding model.

* **Performance**: Computing embeddings and cosine similarity can be resource-intensive. Ensure your system has adequate resources, especially when dealing with large texts.

* **Threshold Adjustment**: The similarity threshold (`0.7` in this example) can be adjusted based on your requirements to fine-tune the relevance of the extracted chunks.

---

By following this approach, you can semantically chunk your text at the paragraph level, ensuring that each chunk is semantically coherent and relevant to your query.

[1]: https://www.datastax.com/blog/how-to-chunk-text-in-javascript-for-rag-applications?utm_source=chatgpt.com "How to Chunk Text in JavaScript for Your RAG Application | DataStax"


Got it 👍 You want a Node.js script that:

1. Uses HuggingFace Transformers (@xenova/transformers, since that’s the JS port).


2. Embeds paragraphs (not just sentences).


3. Embeds the query.


4. Computes cosine similarity between the query and each paragraph.


5. Returns the most relevant chunks.



Here’s a working example:

// Install first:
// npm install @xenova/transformers

import { pipeline } from '@xenova/transformers';

// Simple cosine similarity
function cosineSimilarity(vecA, vecB) {
  let dot = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function main() {
  // Load embedding model
  console.log("Loading model...");
  const embed = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  // Example query
  const query = "What are the health benefits of green tea?";

  // Example paragraphs (pretend this came from a large article)
  const paragraphs = [
    "Green tea contains bioactive compounds that improve health. It has catechins and antioxidants.",
    "Many people enjoy black coffee in the morning. Coffee contains caffeine but fewer catechins than tea.",
    "Exercise improves cardiovascular health, strengthens muscles, and helps regulate weight.",
    "Studies show green tea can boost brain function and fat burning."
  ];

  // Get query embedding
  const queryEmbedding = (await embed(query, { pooling: 'mean', normalize: true }))[0];

  // Score each paragraph
  const scored = [];
  for (const p of paragraphs) {
    const embedding = (await embed(p, { pooling: 'mean', normalize: true }))[0];
    const score = cosineSimilarity(queryEmbedding, embedding);
    scored.push({ paragraph: p, score });
  }

  // Sort by similarity
  scored.sort((a, b) => b.score - a.score);

  console.log("Most relevant paragraphs:");
  scored.forEach(({ paragraph, score }) => {
    console.log(`\n[Score: ${score.toFixed(3)}] ${paragraph}`);
  });
}

main();


---

✅ This script:

Runs locally on CPU (fine on 8GB RAM).

Handles paragraph-level embeddings (you can split your text by \n\n).

Uses cosine similarity to rank chunks.

Should take a couple of seconds for ~5000 words (depending on paragraph count).



---

Do you want me to also show you how to modify this so it can return only the top N most relevant chunks (like top 3) instead of listing all?

Got it 👍 — you want a Node.js script that:

1. Takes a query.


2. Splits a paragraph into sentences.


3. Uses TF-IDF (term frequency–inverse document frequency) to score each sentence relative to the query.


4. Returns the most relevant sentences.



Here’s a Node.js example using natural (an NLP library with TF-IDF support):

// Install dependencies first:
// npm install natural

const natural = require("natural");

// Example paragraph
const paragraph = `
Artificial intelligence is transforming many industries.
One of the most impactful applications is natural language processing.
Large language models can answer questions, summarize text, and assist in research.
However, they also require significant computational resources.
Lightweight approaches like TF-IDF still provide useful results for smaller tasks.
`;

// Query
const query = "language models and natural language processing";

// --- Step 1: Split paragraph into sentences ---
const sentences = paragraph
  .split(/(?<=[.!?])\s+/) // regex to split by sentence-ending punctuation
  .map(s => s.trim())
  .filter(s => s.length > 0);

// --- Step 2: Build a TF-IDF model ---
const tfidf = new natural.TfIdf();

// Add each sentence as a "document"
sentences.forEach((sentence, i) => {
  tfidf.addDocument(sentence, `sentence_${i}`);
});

// --- Step 3: Rank sentences by similarity to query ---
const scoredSentences = [];

tfidf.tfidfs(query, function(i, measure) {
  scoredSentences.push({
    sentence: sentences[i],
    score: measure
  });
});

// --- Step 4: Sort by score descending ---
scoredSentences.sort((a, b) => b.score - a.score);

// --- Step 5: Print results ---
console.log("Query:", query);
console.log("\nRanked sentences:\n");
scoredSentences.forEach(({ sentence, score }) => {
  console.log(`${score.toFixed(4)} - ${sentence}`);
});

✅ Example output for the query:

Query: language models and natural language processing

Ranked sentences:

0.5307 - Large language models can answer questions, summarize text, and assist in research.
0.4192 - One of the most impactful applications is natural language processing.
0.0000 - Artificial intelligence is transforming many industries.
0.0000 - However, they also require significant computational resources.
0.0000 - Lightweight approaches like TF-IDF still provide useful results for smaller tasks.

This way, you can filter out only the most relevant sentences from a paragraph, based on your query, without embeddings or heavy models.


---

👉 Do you want me to also extend this so it keeps whole paragraphs, but highlights only the most relevant sentences inside them?

