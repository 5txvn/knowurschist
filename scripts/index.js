const fs = require('fs');

/**
 * Reads a JSON file, filters objects whose "data" key is set to true,
 * and prints their "id" values.
 * @param {string} filePath - Path to the local .json file.
 */

let i = 0;

function printIdsWithData(filePath) {
    try {
        // 1. Read the file synchronously (useful for scripts)
        const rawData = fs.readFileSync(filePath, 'utf8');

        // 2. Parse the string into a JSON array
        const items = JSON.parse(rawData);

        // Ensure the data is an array
        if (!Array.isArray(items)) {
            console.error("Error: The JSON file must contain an array of objects.");
            return;
        }

        console.log(`Searching for objects with data === true in: ${filePath}\n`);

        // 3. Filter and Print (only when data key is explicitly true)
        items.forEach((item, index) => {
            if (item.data === true) {
                console.log(`Found: ${item.id}`);
                i++;
            }
        });

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error("Error: File not found.");
        } else if (error instanceof SyntaxError) {
            console.error("Error: Failed to parse JSON. Ensure the file is valid JSON.");
        } else {
            console.error("An unexpected error occurred:", error.message);
        }
    }
}

// Replace 'questions.json' with your actual filename
printIdsWithData('../physics/questionBank.json');
console.log(`Total questions with data === true: ${i}`);