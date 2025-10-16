const nlp = require('compromise');
const session = require('sesion_manager')


// get user name from user input
function getName(userInput){

    const sentence = nlp(userInput);
    const name = sentence.people().out('array');
    return  name.length > 0 ? name[0] : null;};

// get user pronouns from user input
function getProunouns(userInput){
    const sentence = nlp(userInput);
    const pronouns = sentence.nouns().out('array');
    return  pronouns.length > 0 ? prounouns : null;
};

// get user age from user input
function getAge(userInput){
    const sentence = nlp(userInput);
    const age = sentence.values().isNumber().out('array')
    return age.length > 0 ? age[0] : null;
};


    



    module.exports = {
    getName,
    getAge,
    getProunouns
}