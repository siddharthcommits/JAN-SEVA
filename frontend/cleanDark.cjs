const fs = require('fs');
const path = require('path');

function removeDark(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      removeDark(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Match "dark:some-class" where the class doesn't contain spaces/quotes
      const newContent = content
        .replace(/dark:[a-zA-Z0-9-\[\]_/\.]+/g, '')
        .replace(/ +/g, ' ') // collapse multiple spaces
        .replace(/ >/g, '>')
        .replace(/ "/g, '"')
        .replace(/" /g, '"');
        
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Cleaned: ${filePath}`);
      }
    }
  });
}

removeDark('./src');
console.log('Done!');
