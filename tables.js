const db = require('./db.js');

(async () => {
    await db.dropMessageTables();
    await db.ensureMessageTables();
    let message = { role: "system", content: "Eres un asistente amigable." };
    await db.postMessage(message);
})();
