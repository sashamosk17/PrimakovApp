const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "src", "infrastructure", "database", "migrations");
const destDir = path.join(__dirname, "..", "dist", "infrastructure", "database", "migrations");

if (fs.existsSync(srcDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".sql"));
  for (const file of files) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  }
  console.log(`✓ Copied ${files.length} SQL migration files to ${destDir}`);
}

