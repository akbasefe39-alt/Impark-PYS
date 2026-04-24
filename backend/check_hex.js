const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.all("SELECT id, firstName, lastName, hex(lastName) as hexName FROM user WHERE firstName LIKE '%Ali%'", [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("--- KULLANICI HEX ANALİZİ ---");
  rows.forEach(row => {
    console.log(`ID: ${row.id} | Ad: ${row.firstName} | Soyad: ${row.lastName} | HEX: ${row.hexName}`);
  });
  db.close();
});
