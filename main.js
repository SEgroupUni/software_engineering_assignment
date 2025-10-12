// Import functions from functions.js
const { tokeniseInput, checkFullInput, compositeMatchScore, getResponse } = require('./functions_file')

userInput = 'hello'

console.log(`User input: ${userInput} -> gives response ${getResponse(userInput)}`)