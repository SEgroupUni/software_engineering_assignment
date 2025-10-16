const {jsonParse, tokeniseInput, checkFullInput,  getResponse } = require('./functions_file')
const stringSimilarity = require('string-similarity');
const intents = require('./intents');
const levenshtein = require('fast-levenshtein');

// Convert Levenshtein distance to similarity score 0-1
function levenshteinSimilarity(str1, str2) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    const distance = levenshtein.get(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
}



function compositeMatchScore(pattern, userInput, tolerance = 0.75) {

    const patternTokens = tokeniseInput(pattern);
    const userTokens = tokeniseInput(userInput);

    //  Unordered word similarity
    const sortedUser = [...userTokens].sort().join(' ');
    const sortedPattern = [...patternTokens].sort().join(' ');
    const sortWordScore = stringSimilarity.compareTwoStrings(sortedUser, sortedPattern);

    //  Sentence length similarity
    const lengthScore = 1 - (Math.abs(userTokens.length - patternTokens.length) / Math.max(userTokens.length, patternTokens.length));

    //  Word order and placement similarity
    const len = Math.min(userTokens.length, patternTokens.length);
    const indexMatchScore = len > 0
        ? userTokens.slice(0, len)
            .map((token, i) => levenshteinSimilarity(token, patternTokens[i]))
            .filter(sim => sim >= 0.3)
            .reduce((sum, sim) => sum + sim, 0) / len
        : 0;

    //  Total word match score (Levenshtein)
    const uniqueUserTokens = [...new Set(userTokens)];
    const uniquePatternTokens = [...new Set(patternTokens)];

    let wordMatchScore = 0;

    for (const patternToken of uniquePatternTokens) {
        let bestMatch = 0;

        for (const userToken of uniqueUserTokens) {
                const similarity = levenshteinSimilarity(userToken, patternToken);
            if (similarity > bestMatch) {
             bestMatch = similarity;
             console.log(bestMatch)
            }
        }

        // after checking all userTokens, add only the best one
        if (bestMatch >= 0.3) {
        wordMatchScore += bestMatch;
        }
    }

    const totalWordMatchScore =uniquePatternTokens.length > 0
        ? wordMatchScore / uniquePatternTokens.length
        : 0;
    console.log(
        "sortWordScore:", sortWordScore,
        "lengthScore:", lengthScore,
        "indexMatchScore:", indexMatchScore,
        "totalWordMatchScore:", totalWordMatchScore,
    );
    


    if(indexMatchScore <= .2){
        let finalScore =
            0.35 * sortWordScore +
            0.25 * lengthScore +
            0.4 * totalWordMatchScore;
            console.log(`final score: ${finalScore}`)
            return finalScore >= tolerance ? finalScore : 0;

        
            

    }
    else{
        const finalScore =
        0.28 * sortWordScore +
        0.18 * lengthScore +
        0.27 * indexMatchScore +
        0.3  * totalWordMatchScore;
        console.log(`final score: ${finalScore}`)
        return finalScore >= tolerance ? finalScore : 0;
        
    }
    
}


pattern = 'i wonder how old your are'
user1 = 'hel my name is'
user2 = 'my name is'
user3 = 'i wonder how old r u'
user4 = 'name is my'
user5 = 'me neme is hollo'


console.log(compositeMatchScore(pattern, user3))