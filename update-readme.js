#!/usr/bin/env node

/**
 * Update README.md with package.json info
 * Replaces {{PACKAGE_NAME}} and {{VERSION}} placeholders
 */

const fs = require('fs');
const path = require('path');

// Read package.json
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const PACKAGE_NAME = packageJson.name;
const VERSION = packageJson.version;

console.log(`📦 Package: ${PACKAGE_NAME}`);
console.log(`🔖 Version: ${VERSION}`);

// Read README template
const readmePath = path.join(__dirname, 'README.md');
let readme = fs.readFileSync(readmePath, 'utf8');

// Replace placeholders
const originalReadme = readme;
readme = readme.replace(/{{PACKAGE_NAME}}/g, PACKAGE_NAME);
readme = readme.replace(/{{VERSION}}/g, VERSION);

// Also replace hardcoded package names and versions
readme = readme.replace(/@raphab3\/hermes-client@[\d.]+/g, `${PACKAGE_NAME}@${VERSION}`);
readme = readme.replace(/@raphab3\/hermes-client(?!@)/g, PACKAGE_NAME);

// Write back
if (readme !== originalReadme) {
    fs.writeFileSync(readmePath, readme, 'utf8');
    console.log('✅ README.md updated successfully!');
} else {
    console.log('ℹ️  No changes needed');
}

