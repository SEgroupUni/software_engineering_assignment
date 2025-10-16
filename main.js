const { getResponse } = require('./chat_logic');
const readline = require('readline');

const readL = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function chat() {
    readL.question('Enter your chitter chatter: ', (userInput) => {
        let botResponse = getResponse(userInput);
        console.log(botResponse.response);
        console.log(`intent: ${botResponse.intent}`)
        
        if (botResponse.intent === 'farewell') {  // if intent returns farewell intent then close the chat function.
            readL.close();
        } else {
            chat(); // recursivley call function to continue conversation
        }
    });
}

chat(); // Start the conversation
