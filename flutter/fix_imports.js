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

  // Replace dot-shorthands
  content = content.replace(/\.textPrimary/g, 'AppColors.textPrimary');
  content = content.replace(/\.textSecondary/g, 'AppColors.textSecondary');

  // Add import if missing and AppColors is used
  if (content.includes('AppColors.') && !content.includes('import.*app_colors.dart')) {
    const importLine = "import '../config/app_colors.dart';";
    if (content.includes('import ')) {
      // Find first import and add after
      const lines = content.split('\n');
      let insertIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('import ')) {
          insertIndex = i + 1;
          break;
        }
      }
      if (insertIndex > 0) {
        lines.splice(insertIndex, 0, importLine);
        content = lines.join('\n');
      }
    }
  }

  if (content !== orig) {
    fs.writeFileSync(file, content);
    changedCount++;
  }
}
console.log('Fixed ' + changedCount + ' files.');