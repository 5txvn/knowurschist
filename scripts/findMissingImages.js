const fs = require("fs");
const path = require("path");

const QUESTION_FILE = "../physics/questionBank.json";
const IMAGE_FOLDER = "../physics/images";
const OUTPUT_FILE = "identifiers.json";

function findMissingImages() {
    try {

        const raw = fs.readFileSync(QUESTION_FILE, "utf8");
        const items = JSON.parse(raw);

        if (!Array.isArray(items)) {
            console.error("JSON must contain an array.");
            return;
        }

        const identifiers = [];

        items.forEach(item => {

            if (item.data === true) {

                const pngPath = path.join(IMAGE_FOLDER, `${item.id}.png`);
                const jpegPath = path.join(IMAGE_FOLDER, `${item.id}.jpeg`);

                const pngExists = fs.existsSync(pngPath);
                const jpegExists = fs.existsSync(jpegPath);

                if (!pngExists && !jpegExists) {
                    console.log(`Missing image for: ${item.id}`);
                    identifiers.push(item.id);
                }

            }

        });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(identifiers, null, 2));

        console.log(`\nSaved ${identifiers.length} identifiers to ${OUTPUT_FILE}`);

    } catch (err) {
        console.error(err);
    }
}

findMissingImages();