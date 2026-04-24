const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

const replacements = [
  { from: 'Ã–', to: 'Ö' },
  { from: 'Ã¼', to: 'ü' },
  { from: 'Ã§', to: 'ç' },
  { from: 'ÅŸ', to: 'ş' },
  { from: 'Ä±', to: 'ı' },
  { from: 'ÄŸ', to: 'ğ' },
  { from: 'Ä°', to: 'İ' },
  { from: 'Ãœ', to: 'Ü' },
  { from: 'Äž', to: 'Ğ' },
  { from: 'Åž', to: 'Ş' },
  { from: 'Ã‡', to: 'Ç' },
  { from: 'Â ', to: ' ' }
];

db.serialize(() => {
  console.log("--- VERİTABANI KARAKTER RESTORASYONU BAŞLADI ---");
  
  replacements.forEach(rep => {
    // User tablosu
    db.run(`UPDATE user SET firstName = REPLACE(firstName, ?, ?), lastName = REPLACE(lastName, ?, ?), unvan = REPLACE(unvan, ?, ?)`, 
      [rep.from, rep.to, rep.from, rep.to, rep.from, rep.to]);
    
    // Departman tablosu
    db.run(`UPDATE departman SET ad = REPLACE(ad, ?, ?)`, [rep.from, rep.to]);
    
    // Izin tablosu (izinTuru, sebep)
    db.run(`UPDATE izin SET izinTuru = REPLACE(izinTuru, ?, ?), sebep = REPLACE(sebep, ?, ?)`, 
      [rep.from, rep.to, rep.from, rep.to]);
    
    // Task tablosu (baslik, aciklama)
    db.run(`UPDATE task SET baslik = REPLACE(baslik, ?, ?), aciklama = REPLACE(aciklama, ?, ?)`, 
      [rep.from, rep.to, rep.from, rep.to]);

    // Expense tablosu (baslik)
    db.run(`UPDATE expense SET baslik = REPLACE(baslik, ?, ?)`, [rep.from, rep.to]);
  });

  console.log("--- RESTORASYON TAMAMLANDI ---");
});

db.close();
