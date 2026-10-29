const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fileDir = path.join(dir, file);
    const stat = fs.statSync(fileDir);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fileDir));
    } else if (file.endsWith('.dart')) {
      results.push(fileDir);
    }
  });
  return results;
}

const files = walk('lib');
let changedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;

  // Fix import paths
  content = content.replace(/import '\.\.\/config\/app_colors\.dart';/g, "import '../../config/app_colors.dart';");

  if (content !== orig) {
    fs.writeFileSync(file, content);
    changedCount++;
  }
}
console.log('Fixed ' + changedCount + ' import paths.');