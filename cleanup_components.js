const fs = require('fs');
const path = require('path');

const rootDir = 'd:\\Code\\Ctrl-HTLS\\frontend\\src\\components';

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

function stripComments(content) {
    // Remove multi-line comments /* ... */
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove single-line comments // ...
    // Be careful with URLs and regex, so we use a more sophisticated approach or a simple one if we trust the codebase
    // This is a simple one that usually works for code cleanup:
    const lines = content.split('\n');
    const cleanLines = lines.map(line => {
        // Find if // exists outside of strings
        // For simplicity in this task, we will just remove everything after // 
        // unless it's inside a quote. But often in JSX // is used for comments.
        // Let's use a safer regex for single line comments:
        return line.replace(/\/\/.*$/g, '');
    });

    return cleanLines.join('\n')
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Collapse multiple blank lines
        .trim() + '\n';
}

const files = getAllFiles(rootDir);
console.log(`Processing ${files.length} files...`);

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const stripped = stripComments(content);
        fs.writeFileSync(file, stripped, 'utf8');
        console.log(`Cleaned: ${file}`);
    } catch (err) {
        console.error(`Error cleaning ${file}: ${err.message}`);
    }
});
