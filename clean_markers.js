const fs = require('fs');
const path = require('path');

const coordsPath = path.join(__dirname, 'public', 'maps', 'coordinates.json');
let data = JSON.parse(fs.readFileSync(coordsPath, 'utf8'));

const originalLength = data.length;
data = data.filter(c => c.name !== 'General Site Marker');

fs.writeFileSync(coordsPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Cleaned up ${originalLength - data.length} General Site Markers`);
