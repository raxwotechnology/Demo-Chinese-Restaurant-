const fs = require('fs');
const path = require('path');

const directory = 'd:/Intern/P1/DemoChineseRestaurantAppbyRaxwo/frontend/src';
const targetUrl = /https:\/\/gasmachineserestaurantapp-7aq4\.onrender\.com/g;
const replacement = '${API_BASE_URL}';

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            walk(filePath);
        } else if (stats.isFile() && (file.endsWith('.jsx') || file.endsWith('.js'))) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('https://gasmachineserestaurantapp-7aq4.onrender.com')) {
                console.log(`Updating ${filePath}`);
                
                // Replace URL
                content = content.replace(targetUrl, replacement);
                
                // Ensure import API_BASE_URL from "../apiConfig" or similar
                if (!content.includes('import API_BASE_URL')) {
                    // Calculate relative path to apiConfig.js
                    const relativeDir = path.relative(path.dirname(filePath), directory);
                    const importPath = path.join(relativeDir, 'apiConfig').replace(/\\/g, '/');
                    const importStatement = `import API_BASE_URL from "${importPath.startsWith('.') ? importPath : './' + importPath}";\n`;
                    content = importStatement + content;
                }
                
                fs.writeFileSync(filePath, content, 'utf8');
            }
        }
    }
}

walk(directory);
console.log('Finished updating hardcoded URLs.');
