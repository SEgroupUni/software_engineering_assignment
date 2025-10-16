// contains functions to call into the main file.
const intents = require('./intents');
const fs = require('fs');
const stringSimilarity = require('string-similarity');
// Enable debug logs for testing
const DEBUG = true; // set to false to silence logs

// return parsed json file of intent, pattern and response scripts, for js.
function  jsonParse(jsonIntents){
            const rawData = fs.readFileSync(jsonIntents, 'utf-8')
            return JSON.parse(rawData)
}

            function tokeniseInput(userInput){

    // Convert user sentence or word into lower case then split sentence.
    return userInput.toLowerCase().split(/\s+/);
}

// ****** Check if whole sentence if similar
function checkFullInput(pattern, user_input, tolerance = 0.6){

    let match = stringSimilarity.compareTwoStrings(user_input.toLowerCase(), pattern.toLowerCase());
    return match >= tolerance ? match : 0;
};


function compositeMatchScore(pattern, userInput, tolerance = 0.72) {

    const patternTokens = tokeniseInput(pattern);
    const userTokens = tokeniseInput(userInput);

    // Unordered word similarity
    const sortedUser = [...userTokens].sort().join(' ');
    const sortedPattern = [...patternTokens].sort().join(' ');
    const sortWordScore = stringSimilarity.compareTwoStrings(sortedUser, sortedPattern);

    // Sentence length similarity
    const differenceInLength = Math.abs(userTokens.length - patternTokens.length);
    const maxLength = Math.max(patternTokens.length, userTokens.length);
    const lengthScore = 1 - (differenceInLength / maxLength);

    // Word order and placement similarity
    let indexMatchScore = 0;
    const len = Math.min(userTokens.length, patternTokens.length);

    if (len > 0) {
        for (let i = 0; i < len; i++) {
            const similarity = stringSimilarity.compareTwoStrings(userTokens[i], patternTokens[i]);
            if (similarity >= 0.2) indexMatchScore += similarity;
        }
    }

    const matchScore = len > 0 ? indexMatchScore / len : 0;

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
    if (bestMatch >= 0.6) {
        wordMatchScore += bestMatch;
    }
}

const totalWordMatchScore =
    uniquePatternTokens.length > 0
        ? wordMatchScore / uniquePatternTokens.length
        : 0;



    // Composite score
    const finalScore =
        0.28 * sortWordScore +
        0.18 * lengthScore +
        0.27 * matchScore +
        0.27 * totalWordMatchScore;

    // the final threshold will only return a score that is greater than the tolerance weight
    return finalScore >= tolerance ? finalScore : 0;
}

function getResponse(userInput) {
    let bestScore = 0;
    let bestIntent = null;
    let bestResponse = null;

    outerLoop: for (const intent of intents) { 
        for (const pattern of intent.patterns) { 
            // get exact match score
            let exactScore = checkFullInput(pattern, userInput);

            // if score lower than composite tolerance, get composite score
            let compositeScore = exactScore < 0.72 ? compositeMatchScore(pattern, userInput) : 0;

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
        response: "I don't understand.",
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