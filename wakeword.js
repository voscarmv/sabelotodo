 const args = process.argv;
 const input = JSON.parse(args[2]);
 const wakeword = args[3];

 console.log(input.text);

 if(input.text === wakeword){
    process.exit(0);
 }

process.exit(1);