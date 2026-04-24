const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.all("SELECT id, firstName, lastName, email FROM user", [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("--- KULLANICI LİSTESİ (ÇIKTI KODLAMASI KONTROLÜ) ---");
  rows.forEach(row => {
    console.log(`ID: ${row.id} | Ad: ${row.firstName} | Soyad: ${row.lastName} | Email: ${row.email}`);
  });
  db.close();
});
