// scripts/extract-two.js
const fs = require('fs');

try {
    // Read the first chunk of the file
    const content = fs.readFileSync('data.json', 'utf8');
    
    // Parse as JSON
    const allProblems = JSON.parse(content);
    
    // Take first two problems
    const twoProblems = allProblems.slice(0, 2);
    
    // Write to new file with pretty formatting
    fs.writeFileSync(
        'test_data.json', 
        JSON.stringify(twoProblems, null, 2)
    );
    
    console.log('Successfully created test_data.json with first two problems');
} catch (error) {
    console.error('Error:', error);
}