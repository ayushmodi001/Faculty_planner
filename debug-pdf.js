const fs = require('fs');
let pdf;
try {
    pdf = require('pdf-parse');
} catch (e) {
    console.error("Require Failed:", e.message);
    process.exit(1);
}

console.log("PDF Library:", pdf);
console.log("Type:", typeof pdf);

try {
    const dataBuffer = fs.readFileSync('Subject_Syllabus_303105377 (7).pdf');
    if (typeof pdf === 'function') {
        pdf(dataBuffer).then(function (data) {
            console.log("Success! Text length:", data.text.length);
        }).catch(function (error) {
            console.error("PDF Parse Error:", error);
        });
    } else if (pdf.default && typeof pdf.default === 'function') {
        pdf.default(dataBuffer).then(function (data) {
            console.log("Success! Text length:", data.text.length);
        }).catch(function (error) {
            console.error("PDF Parse Error:", error);
        });
    } else {
        console.error("pdf is not a function nor has default export");
    }
} catch (e) {
    console.error("File Read Error:", e.message);
}
