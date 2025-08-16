 const args = process.argv;
 const input = JSON.parse(args[2]);

 console.log(input.text);

 if(input.text === 'computadora'){
    process.exit(0);
 }

process.exit(1);