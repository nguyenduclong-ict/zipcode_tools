const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/zipcodes_local.db');

const rows = db.prepare(`
  SELECT SUBSTR(postal_code, 1, 2) as prefix, COUNT(*) as count 
  FROM zipcodes 
  WHERE country_code = 'VN' 
  GROUP BY prefix 
  ORDER BY prefix ASC
`).all();

console.log('Postal code 2-digit prefixes in VN:');
rows.forEach(r => console.log(`Prefix ${r.prefix}xx: ${r.count} records`));
