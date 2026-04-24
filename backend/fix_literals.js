const fs = require('fs');
const path = require('path');

const directory = 'd:/Intern/P1/DemoChineseRestaurantAppbyRaxwo/frontend/src';
// Match "${API_BASE_URL} or "${API_BASE_URL} inside double quotes
const targetPattern = /"\${API_BASE_URL}([^"]*)"/g;
const replacement = '`${API_BASE_URL}$1`';

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            walk(filePath);
        } else if (stats.isFile() && (file.endsWith('.jsx') || file.endsWith('.js'))) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('"${API_BASE_URL}')) {
                console.log(`Fixing template literals in ${filePath}`);
                content = content.replace(targetPattern, replacement);
                fs.writeFileSync(filePath, content, 'utf8');
            }
        }
    }
}

walk(directory);
console.log('Finished fixing template literals.');
