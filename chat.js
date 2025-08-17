const ollama = require("ollama").default;
const db = require('./db.js');
const { tools, functions } = require('./tools.js');
 const args = process.argv;
const message = require(args[2]);

function parseMessages(rows) {
    let arr = '[';
    for (let i = 0; i < rows.length; i++) {
        arr += rows[i].message + ',';
    }
    return JSON.parse(arr.slice(0, -1) + ']');
}
const model = 'qwen2.5:0.5b';
(async () => {
    await db.postMessage({ role: 'user', content: message.text });
    let messages = await db.getAllMessages();
    let completion = await ollama.chat({
        messages: parseMessages(messages),
        tools,
        model,
    });
    await db.postMessage(completion.message);
    if (completion.message.tool_calls && completion.message.tool_calls.length > 0) {
        for (let i = 0; i < completion.message.tool_calls.length; i++) {
            const toolcall = completion.message.tool_calls[i];
            const functionname = toolcall.function.name;
            const functionArgs = toolcall.function.arguments;
            const result = functions[functionname](functionArgs);
            await db.postMessage(
                {
                    tool_call_id: toolcall.id,
                    role: 'tool',
                    content: result
                }
            );
        }
        messages = await db.getAllMessages();
        completion = await ollama.chat({
            messages: parseMessages(messages),
            tools,
            model,
        });
        await db.postMessage(completion.message);
    }
    console.log(completion.message.content);
})();
