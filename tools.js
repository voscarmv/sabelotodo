const tools = [
    {
        type: 'function',
        function: {
            name: 'getDate',
            description: 'Obtener la fecha y hora',
            parameters: {
                type: 'object',
                properties: {
                    language: {
                        type: 'string',
                        enum: ['en-US', 'es-MX'],
                        description: 'El idioma de la fecha y hora',
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
            description: 'Tirar N dados y obtener los resultados',
            parameters: {
                type: 'object',
                properties: {
                    nDice: {
                        type: 'integer',
                        description: 'Número N de dados a tirar'
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