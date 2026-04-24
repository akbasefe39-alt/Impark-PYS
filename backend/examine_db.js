const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

const tables = ['user', 'departman', 'izin', 'task', 'expense'];

tables.forEach(table => {
  db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
    if (err) {
      console.error(`Tablo ${table} okunamadı:`, err);
      return;
    }
    console.log(`--- TABLO: ${table} ---`);
    console.log(rows.map(r => r.name).join(', '));
  });
});

db.close(() => {
  console.log("Şema sorgulama bitti.");
});
