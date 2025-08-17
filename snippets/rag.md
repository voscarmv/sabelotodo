Absolutely—here’s a streamlined, minimal RAG implementation using **Axios** and the **Ollama JavaScript client (`ollama.chat`)** in Node.js (CommonJS). It cuts out manual HTTP logic and syncs nicely with your request.

**Axios** simplifies HTTP calls with promise-based async/await syntax (install with `npm install axios`) ([Axios][1], [GeeksforGeeks][2]).
**Ollama**'s JS client exposes a `.chat(...)` method for prompts, which we’ll use ([GitHub][3]).

---

### Streamlined `rag.js` Code

```js
// rag.js — minimal IIAB RAG with Axios + ollama.chat (CommonJS)

const axios = require('axios');               // for HTTP requests
const { Ollama } = require('ollama');         // Ollama JS client

// Configuration
const IIAB_BASE = process.env.IIAB_BASE || 'http://127.0.0.1:80';
const IIAB_CONTENT = process.env.IIAB_CONTENT || '';
const MAX_ARTICLES = 5;
const MAX_CHUNKS = 8;
const CHUNK_SIZE = 800;
const OVERLAP = 100;
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

const ollama = new Ollama({ host: process.env.OLLAMA_URL || 'http://127.0.0.1:11434' });

// Helpers
function stripHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
             .replace(/<style[\s\S]*?<\/style>/gi, ' ')
             .replace(/<[^>]+>/g, ' ')
             .replace(/\s+/g, ' ').trim();
}

function chunkText(text, size = CHUNK_SIZE, overlap = OVERLAP) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    const chunk = text.slice(i, i + size).trim();
    if (chunk.length > size / 4) chunks.push(chunk);
  }
  return chunks;
}

function scoreChunks(chunks, query) {
  const q = query.toLowerCase().split(/\s+/);
  return chunks
    .map((text, i) => ({
      idx: i,
      score: q.reduce((s, w) => s + (text.toLowerCase().includes(w) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score);
}

// RAG pipeline
async function answerWithRAG(query) {
  // 1) Search IIAB
  const params = new URLSearchParams();
  if (IIAB_CONTENT) params.set('content', IIAB_CONTENT);
  params.set('pattern', query);
  params.set('format', 'json');
  const searchUrl = `${IIAB_BASE}/search?${params.toString()}`;
  
  let hits;
  try {
    const res = await axios.get(searchUrl);
    hits = Array.isArray(res.data) ? res.data :
           Array.isArray(res.data.results) ? res.data.results :
           [];
  } catch {
    const res = await axios.get(searchUrl.replace(/([?&])format=json(&?)/, '$1'));
    hits = []; // fallback; could parse HTML if needed
  }
  
  const articles = hits.slice(0, MAX_ARTICLES).map(h => ({
    title: h.title || h.name || '',
    url: new URL(h.link || h.href || '', IIAB_BASE).toString(),
  }));

  if (!articles.length) return { answer: "No documents found.", sources: [] };

  // 2) Retrieve & chunk articles
  const allChunks = [];
  for (const art of articles) {
    try {
      const html = (await axios.get(art.url)).data;
      const text = stripHtml(html);
      chunkText(text).forEach(chunk => allChunks.push({ ...art, chunk }));
    } catch {}
  }

  if (!allChunks.length) return { answer: "Articles found but content unreadable.", sources: articles };

  // 3) Score and pick top chunks
  const scored = scoreChunks(allChunks.map(c => c.chunk), query);
  const topChunks = scored.slice(0, MAX_CHUNKS).map(s => allChunks[s.idx].chunk);

  // 4) Prompt Ollama
  const messages = [
    { role: "system", content: "Use provided context to answer accurately; say you don't know if unsure." },
    { role: "user", content: `${query}\n\nContext:\n${topChunks.join("\n---\n")}` },
  ];

  const resp = await ollama.chat({ model: MODEL, messages });
  const content = resp.message?.content || resp.message;

  return {
    answer: content.trim(),
    sources: articles.map(a => `${a.title} (${a.url})`),
  };
}

// CLI usage
if (require.main === module) {
  const q = process.argv.slice(2).join(' ').trim();
  (async () => {
    if (!q) {
      console.error('Usage: node rag.js "Your question"');
      process.exit(1);
    }
    try {
      const { answer, sources } = await answerWithRAG(q);
      console.log('\nAnswer:\n', answer, '\nSources:\n', sources.join('\n'));
    } catch (err) {
      console.error('Error:', err);
    }
  })();
}

module.exports = { answerWithRAG };
```

---

### Why it’s simpler & shorter

* **HTTP via Axios**: clean `axios.get(...)` usage with promises/async → far more succinct ([Axios][1], [GeeksforGeeks][2]).
* **Ollama Chat API**: just import and call `.chat(...)` with structured `messages` payload ([GitHub][3]).
* **Minimal chunking & scoring**: linear slices and word-matching keep things simple.
* **Modular & concise**: under 120 lines, no manual `http`/`https` boilerplate, fewer helper functions.

Let me know if you’d like to swap to streaming, adjust chunk logic, or customize the prompt further!

[1]: https://axios-http.com/docs/intro?utm_source=chatgpt.com "Getting Started | Axios Docs"
[2]: https://www.geeksforgeeks.org/node-js/how-to-use-axios-npm-to-generate-http-requests/?utm_source=chatgpt.com "How To Use Axios NPM to Generate HTTP Requests - GeeksforGeeks"
[3]: https://github.com/ollama/ollama-js?utm_source=chatgpt.com "Ollama JavaScript library - GitHub"
