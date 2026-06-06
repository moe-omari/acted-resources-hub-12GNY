const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/coordinates.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('hi')

data.forEach(entry => {
  if (entry.siteName === "Shams") {
    entry.governorate = "Khanyounis";
    entry.area = "Mawasi Al-Qarara";
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Updated all Shams site entries.');