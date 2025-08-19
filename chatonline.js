const OpenAI = require("openai");
const db = require('./db.js');
const { tools, functions } = require('./tools.js');
const args = process.argv;
const message = require(args[2]);

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.deepseek_key
});

function parseMessages(rows) {
    let arr = '[';
    for (let i = 0; i < rows.length; i++) {
        arr += rows[i].message + ',';
    }
    return JSON.parse(arr.slice(0, -1) + ']');
}
const model = 'deepseek-chat';
(async () => {
    await db.postMessage({ role: 'user', content: message.text });
    let messages = await db.getAllMessages();
    let completion = await openai.chat.completions.create({
        messages: parseMessages(messages),
        tools,
        model,
    });
    await db.postMessage(completion.choices[0].message);
    if (completion.choices[0].message.tool_calls && completion.choices[0].message.tool_calls.length > 0) {
        for (let i = 0; i < completion.choices[0].message.tool_calls.length; i++) {
            const toolcall = completion.choices[0].message.tool_calls[i];
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
        completion = await openai.chat.completions.create({
            messages: parseMessages(messages),
            tools,
            model,
        });
        await db.postMessage(completion.choices[0].message);
    }
    console.log(completion.choices[0].message.content);
    process.exit(0);
})();
