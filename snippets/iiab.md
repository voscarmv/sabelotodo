Here’s how you’d build an offline RAG system with Kiwix + Ollama + FAISS **without using LangChain**, highlighting key differences, control flow, and integration steps.

---

## ✅ Overview: What You Build vs. What LangChain Provides

* **You’ll do everything manually**: prompt engineering, search orchestration, embedding, retrieval, and answering logic.
* **More control, less abstraction**: no chain dependencies, but more boilerplate.
* **Fine-tuned behavior**: every step is explicit—prompts, embeddings, retriever logic, chunking, caching.

---

## 🛠️ Step-by-Step NodeJS Script (No LangChain)

```js
import fetch from "node-fetch";
import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { FaissStore } from "@langchain/community";
import { CharacterTextSplitter } from "@langchain/text_splitter";

// 1. Decompose a question into sub-queries using Ollama
async function decompose(question) {
  const llm = new Ollama({ model: "llama2", temperature: 0 });
  const resp = await llm.call([
    { role: "system", content: "Split into JSON array of sub_queries." },
    { role: "user", content: question }
  ]);
  return JSON.parse(resp.text).sub_queries;
}

// 2. Search IIAB / Kiwix‑serve for each sub-query
async function searchIIAB(query) {
  const url = new URL("http://localhost:8080/search");
  url.searchParams.set("pattern", query);
  url.searchParams.set("books.name", "wikipedia_en");
  url.searchParams.set("start", "1");
  url.searchParams.set("pageLength", "3");
  url.searchParams.set("format", "xml");
  const xml = await fetch(url).then(r => r.text());
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  return items.map(m => ({
    title: /<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(m[1])?.[1],
    path: /<link><!\[CDATA\[(.*?)\]\]><\/link>/.exec(m[1])?.[1]
  }));
}

// 3. Fetch full article content
async function fetchHtml(path) {
  return fetch(`http://localhost:8080/content/wikipedia_en/${path}`).then(r => r.text());
}

// 4. Build embedding index from retrieved docs
async function buildIndex(docs) {
  const splitter = new CharacterTextSplitter({ chunkSize: 800, chunkOverlap: 200 });
  const chunks = await splitter.splitDocuments(docs);
  const embedder = new OllamaEmbeddings({ model: "ollama/embed-7b" });
  const store = new FaissStore(embedder, {});
  await store.addDocuments(chunks);
  return store;
}

// 5. Answer with retriever + LLM
async function answerQuestion(index, question) {
  const retriever = index.asRetriever({ k: 3 });
  const llm = new Ollama({ model: "ollama/llama2", temperature: 0 });
  const candidateChunks = await retriever.getRelevantDocuments(question);

  const context = candidateChunks.map(c => c.pageContent).join("\n\n");
  const prompt = `
Context:
${context}

Question: ${question}
Answer:
`;
  const resp = await llm.call([{ role: "user", content: prompt }]);
  return resp.text;
}

// 6. Full pipeline
(async () => {
  const userQ = "What is semantic search in AI compared to keyword search?";
  const subqs = await decompose(userQ);

  const docs = [];
  for (const sq of subqs) {
    const hits = await searchIIAB(sq);
    for (const h of hits) {
      const html = await fetchHtml(h.path);
      docs.push({ pageContent: html, metadata: { title: h.title } });
    }
  }

  const index = await buildIndex(docs);
  const answer = await answerQuestion(index, userQ);
  console.log("Answer:\n", answer);
})();
```

---

## 🧠 Key Differences (vs. LangChain-managed RAG)

| Component        | With LangChain                    | Manual Approach (above)                  |
| ---------------- | --------------------------------- | ---------------------------------------- |
| Flow definition  | Chain + tool orchestration        | Manual async/await order; explicit steps |
| Decomposition    | `LLMChain(decomposeChain)`        | Manual `decompose()` prompt & parsing    |
| Search iteration | Agent automatically uses tools    | Loop over sub-queries manually           |
| Retrieval        | `VectorStoreRetriever`            | `FaissStore.asRetriever({...})`          |
| QoL utilities    | Prompt templates, memory, caching | Custom prompt strings & structures       |
| Debugging        | Abstracted, harder to inspect     | Fully visible — easier to trace behavior |

---

## 🔧 Why This Manual Approach Might Suit You Better

* **Full transparency**—you control exactly what's sent to the LLM and how snippets are used.
* **Lower dependency overhead**—no chain abstractions you might later outgrow.
* **Customizable behavior**—easy to tweak search count, embedding chunk sizes, prompt formatting.

---

### 🟢 Real-World Analogs

* Some community projects like **Volo** use exactly this pattern: Kiwix → local LLM → answer synthesis without LangChain ([reddit.com][1], [reddit.com][2], [reddit.com][3], [pypi.org][4], [github.com][5], [en.wikipedia.org][6], [viblo.asia][7], [reddit.com][8]).
* Another example: **txtai-wikipedia microservice** that exposes simple search + content endpoints for offline QA integration ([reddit.com][9]).

---

## ✅ Summary

* You **don’t need LangChain** to build an offline RAG agent—everything can be coded manually.
* This gives you **total control**, but requires more explicit coding for each pipeline step.
* Use Kiwix’s `/search` and `/content` endpoints as your search API.
* Embed, index, and retrieve manually using FAISS and Ollama models.
* This approach scales easily and avoids hidden framework behavior with LangChain.

Would you like enhancements—like adding semantic reranking, caching, or safe prompt parsing—to this manual pipeline?

[1]: https://www.reddit.com/r/LocalLLaMA/comments/1hzsvkz?utm_source=chatgpt.com "Volo: An easy and local way to RAG with Wikipedia!"
[2]: https://www.reddit.com/r/LocalLLaMA/comments/18hgf17?utm_source=chatgpt.com "Local LLM chat agent with advanced RAG and memory"
[3]: https://www.reddit.com/r/LangChain/comments/1j2h3f8?utm_source=chatgpt.com "Best LangChain alternatives"
[4]: https://pypi.org/project/llm-tools-kiwix/?utm_source=chatgpt.com "llm-tools-kiwix · PyPI"
[5]: https://github.com/Wakoma/OfflineAI?utm_source=chatgpt.com "GitHub - Wakoma/OfflineAI: Local/Offline Machine Learning Resources"
[6]: https://en.wikipedia.org/wiki/Internet-in-a-Box?utm_source=chatgpt.com "Internet-in-a-Box"
[7]: https://viblo.asia/p/llm-101-cai-dat-ki-thuat-rag-su-dung-hybrid-search-embed-caching-va-mistral-ai-WR5JRBADJGv?utm_source=chatgpt.com "[LLM 101] Cài đặt kĩ thuật RAG sử dụng Hybrid Search, Embed Caching và Mistral-AI"
[8]: https://www.reddit.com/r/LLMDevs/comments/1hfjfo6?utm_source=chatgpt.com "Alternative to LangChain?"
[9]: https://www.reddit.com/r/LocalLLaMA/comments/1ee0agn?utm_source=chatgpt.com "A little present for y'all: An easy to use offline API that serves up full text Wikipedia articles. Start it up, send in a query/prompt to the endpoint, get back a matching full wiki article to RAG against."
