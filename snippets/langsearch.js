// dependencies
const fetch = require('node-fetch-commonjs'); // For fetch in CommonJS environments :contentReference[oaicite:0]{index=0}
const { Ollama } = require('ollama'); // official Ollama JS client :contentReference[oaicite:1]{index=1}
const { OllamaEmbeddings } = require('@langchain/ollama');
const { FaissStore } = require('@langchain/community');
const { CharacterTextSplitter } = require('@langchain/text_splitter');

// 1. Decompose question into sub-queries
async function decompose(question) {
  const llm = new Ollama({ model: 'llama2', temperature: 0 });
  const resp = await llm.chat({
    model: 'llama2',
    messages: [
      { role: 'system', content: 'Split the question into a JSON array of sub_queries.' },
      { role: 'user', content: question }
    ]
  });
  return JSON.parse(resp.message.content).sub_queries;
}

// 2. Search via IIAB / Kiwix-serve
async function searchIIAB(query, opts = { start: 1, limit: 3 }) {
  const url = new URL('http://localhost:8080/search');
  url.searchParams.set('pattern', query);
  url.searchParams.set('books.name', 'wikipedia_en');
  url.searchParams.set('start', opts.start);
  url.searchParams.set('pageLength', opts.limit);
  url.searchParams.set('format', 'xml');

  const xml = await fetch(url.toString()).then(r => r.text());
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  return items.map(m => ({
    title: /<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(m[1])[1],
    path: /<link><!\[CDATA\[(.*?)\]\]><\/link>/.exec(m[1])[1]
  }));
}

// 3. Retrieve full article content
async function fetchHtml(path) {
  const res = await fetch(`http://localhost:8080/content/wikipedia_en/${path}`);
  return res.text();
}

// 4. Build FAISS index from document chunks
async function buildIndex(docs) {
  const splitter = new CharacterTextSplitter({ chunkSize: 800, chunkOverlap: 200 });
  const chunks = await splitter.splitDocuments(docs);

  const embedder = new OllamaEmbeddings({ model: 'ollama/embed-7b' });
  const store = new FaissStore(embedder, {});
  await store.addDocuments(chunks);
  return store;
}

// 5. Retrieve relevant contexts and answer via Ollama
async function answerQuestion(index, question) {
  const retriever = index.asRetriever({ k: 3 });
  const results = await retriever.getRelevantDocuments(question);
  const context = results.map(r => r.pageContent).join('\n\n');

  const llm = new Ollama({ model: 'llama2', temperature: 0 });
  const resp = await llm.chat({
    model: 'llama2',
    messages: [{ role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}\nAnswer:` }]
  });
  return resp.message.content;
}

// 6. Main pipeline execution
(async () => {
  const question = 'What is semantic search in AI compared to keyword search?';
  const subqs = await decompose(question);

  const docs = [];
  for (const sq of subqs) {
    const hits = await searchIIAB(sq);
    for (const h of hits) {
      const html = await fetchHtml(h.path);
      docs.push({ pageContent: html, metadata: { title: h.title } });
    }
  }

  const index = await buildIndex(docs);
  const answer = await answerQuestion(index, question);
  console.log('Answer:\n', answer);
})();
