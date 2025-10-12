// Import functions from functions.js
const { tokeniseInput, checkFullInput, getResponse } = require('./functions_file')
const stringSimilarity = require('string-similarity');

function compositeMatchScore(pattern, tokenArray){

    let patternTokens = tokeniseInput(pattern)
    let userTokens = tokeniseInput(tokenArray)

    // first comp, overall word similarity/
    const sortedUser = [...userTokens].sort().join(' ');
    const sortedPattern = [...patternTokens].sort().join(' ');
    let sortWordScore = stringSimilarity.compareTwoStrings(sortedUser, sortedPattern)

    // second comp, sentence length similarity.

    let differenceInLength = Math.abs(userTokens.length - patternTokens.length) // difference in length of two arrays
    let maxLength = Math.max(patternTokens.length, userTokens.length);          // maximum length it could be
    let lengthScore = 1 - (differenceInLength/maxLength)                        // 1 minus real value of difference, the closer to 1, smaller disparity in size.


    // third comp, word match and placement.
    let indexMatchScore = 0;
    const len = Math.min(userTokens.length, patternTokens.length);
    for (let i = 0; i < len; i++) {
        const similarity = stringSimilarity.compareTwoStrings(userTokens[i], patternTokens[i]); // check word index placement and spelling of original sentence.
        if(similarity >= 0.3) // this prevents very weak score from influencing output
        indexMatchScore += similarity; 
    }
    // real score from divsion
    let matchScore = indexMatchScore/len

    //total word match score
    const uniqueUserTokens = [...new Set(userTokens)];
    const uniquePatternTokens = [...new Set(patternTokens)];

    // Compute total word match score
    let wordMatchScore = 0;
    for (const patternToken of uniquePatternTokens) {
        for (const userToken of uniqueUserTokens) {
            const similarity = stringSimilarity.compareTwoStrings(userToken, patternToken); // any match above 0.3 score is added.
            if(similarity >= 0.3) // this prevents very weak score from influencing output
            wordMatchScore += similarity; 
        }
    }
    const totalWordMatchScore = wordMatchScore / uniquePatternTokens.length;

    const finalScore = (
    0.3 * sortWordScore +       // unordered word similarity
    0.15 * lengthScore +        // sentence length similarity
    0.25 * matchScore +         // ordered word similarity
    0.3 * totalWordMatchScore   // thresholded word match
    );
    
    console.log(`the composite score is ${finalScore}`)
    if(finalScore >= 0.65){
        return true
    }
    else{
        return false
    }
}

testToken = 'te'
testPattern = 'what is your age'

compositeMatchScore(testPattern, testToken)