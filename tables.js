const db = require('./db.js');

(async () => {
    await db.dropMessageTables();
    await db.ensureMessageTables();
    let message = { role: "system", content: "Eres un asistente amigable." };
    console.log('start post');
    await db.postMessage(message);
    console.log('end post');
})();
