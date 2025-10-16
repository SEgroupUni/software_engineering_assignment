// contains functions to call into the main file.
const fs = require('fs');
const stringSimilarity = require('string-similarity');
const levenshtein = require('fast-levenshtein');
const session = require('sesion_manager')

// Convert Levenshtein distance to similarity score 0-1
function levenshteinSimilarity(str1, str2) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    const distance = levenshtein.get(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
}
// Enable debug logs for testing
const DEBUG = false; // set to false to silence logs

// return parsed json file of intent, pattern and response scripts, for js.
function  jsonParse(jsonIntents){
            const rawData = fs.readFileSync(jsonIntents, 'utf-8')
            return JSON.parse(rawData)
}
const intentsData = jsonParse('intents.json'); 
const intents = Array.isArray(intentsData.intents) ? intentsData.intents : []; // create array of object literals

// Convert user sentence or word into lower case then split sentence.
function tokeniseInput(userInput){
    return userInput.toLowerCase().split(/\s+/);
}

// ****** Check if whole sentence if similar
function checkFullInput(pattern, user_input, tolerance = 0.6){

    let match = stringSimilarity.compareTwoStrings(user_input.toLowerCase(), pattern.toLowerCase());
    return match >= tolerance ? match : 0;
};


function compositeMatchScore(pattern, userInput, tolerance = 0.75) {
    // tokenise user input to compare isolated words.
    const patternTokens = tokeniseInput(pattern);
    const userTokens = tokeniseInput(userInput);

    //  Unordered word similarity
    const sortedUser = [...userTokens].sort().join(' ');
    const sortedPattern = [...patternTokens].sort().join(' ');
    const sortWordScore = stringSimilarity.compareTwoStrings(sortedUser, sortedPattern);

    //  Sentence length similarity
    const lengthScore = 1 - (Math.abs(userTokens.length - patternTokens.length) / Math.max(userTokens.length, patternTokens.length));

    // Word order and placement similarity
    const len = Math.min(userTokens.length, patternTokens.length);
    const indexMatchScore = len > 0
        ? userTokens.slice(0, len)
            .map((token, i) => levenshteinSimilarity(token, patternTokens[i]))
            .filter(sim => sim >= 0.3)
            .reduce((sum, sim) => sum + sim, 0) / len
        : 0;

    // Total word match score (Levenshtein)
    const uniqueUserTokens = [...new Set(userTokens)];
    const uniquePatternTokens = [...new Set(patternTokens)];

    let wordMatchScore = 0;
    for (const patternToken of uniquePatternTokens) {
        
        let bestMatch = 0;
        for (const userToken of uniqueUserTokens) {
                const similarity = levenshteinSimilarity(userToken, patternToken);
            if (similarity > bestMatch) {
             bestMatch = similarity;
            }
        }
        // after checking all userTokens, add only the best one
        if (bestMatch >= 0.3) {
        wordMatchScore += bestMatch;
        }
    }
    const totalWordMatchScore =uniquePatternTokens.length > 0? wordMatchScore / uniquePatternTokens.length: 0;
    // to avoid low indexMatch score increasing chance of false negative, if lowscore ignore.
    if(indexMatchScore <= .2){
        let finalScore =
        0.35 * sortWordScore +
        0.2 * lengthScore +
        0.45 * totalWordMatchScore;
         return finalScore >= tolerance ? finalScore : 0;
    }
    else{
        const finalScore =
        0.25 * sortWordScore +
        0.1 * lengthScore +
        0.3 * indexMatchScore +
        0.34 * totalWordMatchScore;
        return finalScore >= tolerance ? finalScore : 0;
    }
}

function getResponse(userInput) {
    let bestScore = 0;
    let bestIntent = null;
    let bestResponse = null;

    outerLoop: for (const intent of intents) { 
        for (const pattern of intent.patterns) { 
            // get whole sentence exact match score using string similarity
            let exactScore = checkFullInput(pattern, userInput);

            // if score lower than composite tolerance, get composite score on length, string similarty and levenshtien distance algorithim.
            let compositeScore = exactScore < 0.75 ? compositeMatchScore(pattern, userInput) : 0;

            // get score for iteration
            let score = Math.max(exactScore, compositeScore);

            // Log matches for testing visibility
            if (DEBUG && score > 0) {
            console.log(`Pattern: "${pattern}" | Intent: "${intent.intent}" | Exact: ${exactScore.toFixed(2)} | Composite: ${compositeScore.toFixed(2)} | Final: ${score.toFixed(2)}`);
            }

            // Update best match
            if (score > bestScore) {
            bestScore = score;
            bestIntent = intent.intent;
            bestResponse = intent.responses[Math.floor(Math.random() * intent.responses.length)];

                // Early break if we have a perfect match
                if (bestScore === 1.0) {
                    break outerLoop;
                }
            }   
        }
    }
    // if strong match/matches found return best match.
    if (bestIntent !== null) {
        return {
            intent: bestIntent,
            response: bestResponse,
            score: bestScore
        };
    }

    // Fallback when nothing matches
    return {
        intent: null,
        response: "thats intresting ill think about it.",
        score: bestScore
    };
}



// Export all functions for main file
module.exports = {
    jsonParse,
    tokeniseInput,
    checkFullInput,
    compositeMatchScore,
    getResponse
};