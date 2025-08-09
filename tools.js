const tools = [
    {
        type: 'function',
        function: {
            name: 'getDate',
            description: 'Get the current date and time',
            parameters: {
                type: 'object',
                properties: {
                    language: {
                        type: 'string',
                        enum: ['en-US', 'es-MX'],
                        description: 'The language of the date and time',
                    }
                },
                required: ['language']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'throwDice',
            description: 'Throw N dice and get the results',
            parameters: {
                type: 'object',
                properties: {
                    nDice: {
                        type: 'integer',
                        description: 'Number N of dice to throw'
                    }
                },
                required: ['nDice']
            }
        }
    }
];

functions = {
    getDate: (params) => {
        const { language } = params;
        const myDate = new Date();
        return myDate.toLocaleString(language);
    },
    throwDice: (params) => {
        const { nDice } = params;
        let result = [];
        for(let i = 0; i < nDice; i++){
            result.push(5);
        }
        return JSON.stringify(result);
    }
};

module.exports = {
    tools,
    functions
};