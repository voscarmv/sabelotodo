const ollama = require("ollama").default;
const readline = require('readline');
const db = require('./db.js');
const { tools, functions } = require('./tools.js');

const readLineAsync = () => {
    const rl = readline.createInterface({
        input: process.stdin
    });

    return new Promise((resolve) => {
        rl.prompt();
        rl.on('line', (line) => {
            rl.close();
            resolve(line);
        });
    });
};

function parseMessages(rows) {
    let arr = '[';
    for (let i = 0; i < rows.length; i++) {
        arr += rows[i].message + ',';
    }
    return JSON.parse(arr.slice(0, -1) + ']');
}

(async () => {
    await db.dropTables();
    await db.ensureTables();

    let user_id = await db.postRecord('users', { id: 123456 });
    let message = { role: "system", content: "You are a helpful assistant." };

    await db.postRecord('messages', { user_id, message: JSON.stringify(message) });
    let messages;

    while (true) {
        const content = await readLineAsync(); // Tell me the time and throw 5 dice
        if (content === 'exit') { break; }
        await db.postRecord('messages', { user_id, message: JSON.stringify({ role: 'user', content }) })
        messages = await db.getAllRecords('messages', { user_id });
        let completion = await ollama.chat({
            messages: parseMessages(messages),
            tools,
            model: "qwen2.5:3B",
        });
        await db.postRecord('messages', { user_id, message: JSON.stringify(completion.message) });
        if (completion.message.tool_calls && completion.message.tool_calls.length > 0) {
            for (let i = 0; i < completion.message.tool_calls.length; i++) {
                const toolcall = completion.message.tool_calls[i];
                const functionname = toolcall.function.name;
                const functionArgs = toolcall.function.arguments;
                const result = functions[functionname](functionArgs);
                await db.postRecord('messages', {
                    user_id, message: JSON.stringify(
                        {
                            tool_call_id: toolcall.id,
                            role: 'tool',
                            content: result
                        }
                    )
                });
            }
            messages = await db.getAllRecords('messages', { user_id });
            completion = await ollama.chat({
                messages: parseMessages(messages),
                tools,
                model: "qwen2.5:3B",
            });
            await db.postRecord('messages', { user_id, message: JSON.stringify(completion.message) });
        }
        console.log(completion.message.content);
    }
})();
