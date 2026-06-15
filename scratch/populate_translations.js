const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'app', 'service-mapping', 'page.js');
const transPath = path.join(__dirname, '..', 'public', 'maps', 'site_translations.json');

function run() {
  if (!fs.existsSync(pagePath)) {
    console.error('page.js not found at:', pagePath);
    return;
  }

  const content = fs.readFileSync(pagePath, 'utf8');

  // Regex to find siteNames sections in page.js
  // We want to capture the English dictionary and the Arabic dictionary.
  // The first siteNames: { ... } is English, the second is Arabic.
  const regex = /siteNames:\s*\{([^}]+)\}/g;
  let match;
  const sections = [];

  while ((match = regex.exec(content)) !== null) {
    sections.push(match[1]);
  }

  if (sections.length < 2) {
    console.error('Could not find both siteNames dictionaries in page.js. Found:', sections.length);
    return;
  }

  const enSection = sections[0];
  const arSection = sections[1];

  const translations = {};

  // Helper to parse key-value lines
  // e.g. 'AL Amal college': 'AL Amal college', or "AL Amal college": "كلية الأمل",
  function parseLines(sectionStr, lang, targetObj) {
    const lines = sectionStr.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) return;
      
      // Split on colon, but only the first one
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) return;
      
      let key = trimmed.slice(0, colonIdx).trim();
      let val = trimmed.slice(colonIdx + 1).trim();
      
      // Strip trailing comma
      if (val.endsWith(',')) {
        val = val.slice(0, -1).trim();
      }
      
      // Strip quotes
      key = stripQuotes(key);
      val = stripQuotes(val);
      
      if (!key) return;
      
      if (!targetObj[key]) {
        targetObj[key] = { en: key, ar: '' };
      }
      
      if (lang === 'en') {
        targetObj[key].en = val || key;
      } else if (lang === 'ar') {
        targetObj[key].ar = val;
      }
    });
  }

  function stripQuotes(str) {
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
      return str.slice(1, -1);
    }
    return str;
  }

  // Parse English and Arabic sections
  parseLines(enSection, 'en', translations);
  parseLines(arSection, 'ar', translations);

  // Load existing translations if file exists
  let existing = {};
  if (fs.existsSync(transPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(transPath, 'utf8'));
    } catch (e) {
      console.warn('Failed to parse existing site_translations.json:', e);
    }
  }

  // Merge: existing dynamically added ones take precedence
  const merged = { ...translations, ...existing };

  // Make sure Arabic values fallback to English if empty, or clean up
  Object.keys(merged).forEach(k => {
    if (!merged[k].en) {
      merged[k].en = k;
    }
    if (!merged[k].ar) {
      merged[k].ar = merged[k].en; // fallback to English name if no translation exists
    }
  });

  // Write merged output
  fs.mkdirSync(path.dirname(transPath), { recursive: true });
  fs.writeFileSync(transPath, JSON.stringify(merged, null, 2), 'utf8');

  console.log(`Successfully merged site translations! Total sites in registry: ${Object.keys(merged).length}`);
}

run();
