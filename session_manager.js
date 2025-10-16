const fs = require("fs");

const templateJsonFile = "chat_history.json";

function loadTemplate() {
    const data = fs.readFileSync(templateJsonFile, "utf8");
    return JSON.parse(data); // Returns the template object
}

class Session {

    constructor(){
        this.id = new Date().toISOString();
        this.user = { name: null, age: null, pronouns: null };
        this.chatLog = [];
    }

    setName(name){
        this.user.name = name;
    }

    setAge(age){
        this.user.age = age;
    }

    setPronouns(pronouns){
        this.user.pronouns = pronouns;
    }

    logChat(userInput, botResponse){
        this.chatLog.push({ 
            userInput: userInput,
            botResponse: botResponse.response // assuming botResponse is an object
        });
    }

    getTempJson(){
        return JSON.stringify({ chatLog: this.chatLog }, null, 2);
    }

    archiveSession(){
        const template = loadTemplate(); // call the function
        template.id = this.id;
        template.user = { ...this.user };
        template.chatLog = [ ...this.chatLog ]; // copy array properly

        // // Optionally save to file
        // const fs = require("fs");
        // const path = require("path");
        // const filePath = path.join(__dirname, `session_${this.id}.json`);
        // fs.writeFileSync(filePath, JSON.stringify(template, null, 2));
    }
}

module.exports = Session;
