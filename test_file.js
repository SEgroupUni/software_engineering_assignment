const { getResponse } = require('./functions_file');

const { 
    testDatasetExact, 
    testDatasetFuzzy, 
    testDatasetBoundary, 
    testDatasetErroneous 
} = require('./test_data');

const testLoop = [
    'Exact data', testDatasetExact,
    'Misspelt / poor grammar data', testDatasetFuzzy,
    'Boundary data', testDatasetBoundary,
    'Erroneous data', testDatasetErroneous
];

function runSampleTests(testType, dataSet) {
    let passed = 0;

    for (const test of dataSet) {
        const userInput = test.text;
        const result = getResponse(userInput);

        if (result.intent === test.expectedIntent) {
            passed++;
            console.log(`PASS: "${test.text}" gave expected output of "${test.expectedIntent}"`);
        } else {
            console.log(`FAIL: "${test.text}" output "${result.intent}" instead of "${test.expectedIntent}`);
        }
    }

    const len = dataSet.length;
    const passRate = ((passed / len) * 100).toFixed(2);

    console.log(`${testType} has a ${passRate}% pass rate.\n`);
}

// Loop through testLoop in pairs
for (let i = 0; i < testLoop.length; i += 2) {
    runSampleTests(testLoop[i], testLoop[i + 1]);
}