---
description: Sistemin SQLite veritabanını sağlama alma, onarma ve yedekleme işlemleri
---

# Veritabanı (DB) Yönetimi & Güvenlik İş Akışı

Bu iş akışı dosyasında, lokal ortamdaki (veya canlıya hazır hale getirilecek) SQLite veritabanlarının (`database.sqlite`) güvenliği, test ortamından temize çekilmesi veya yedeklenmesi işlemleri bulunur. Veri tutarsızlıkları veya `401/403` kritik giriş sorunları çözülemiyorsa bu yetenek belgelerinden destek alınmalıdır.

## 1. Veritabanı Yedekleme (Backup) Standartları

Canlı sistemi (Production Database) veya aktif veritabanını etkileyebilecek majör geliştirmeler yapılmadan önce yapay zeka `database.sqlite` dosyasının bir kopyasını almalıdır.

// turbo-all
## Veritabanı Yedekleme (Backup)
Şu komutu çalıştırarak aktif veritabanının yedeği alınabilir:

```bash
# Windows ortamında SQLite dosyasının yedeğini oluşturur
cd backend && copy database.sqlite database_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sqlite
```

## 2. Test Kullanıcılarını Yeniden Üretme / Şifre Onarımı

Veritabanındaki hesaplar bozulduğunda ve acil erişim (Emergency Auth Bypass) gerektiğinde şifre hashlerini varsayılan (`123`) haline getirmek için kullanılan onarım betiği.

// turbo-all
## Şifre Hasar Tespiti & Acil Onarım
```bash
node -e "
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
async function run() {
  const hash = await bcrypt.hash('123', 10);
  const db = new sqlite3.Database('./backend/database.sqlite');
  db.run('UPDATE user SET password = ?', [hash], (e) => {
    if(e) console.error('HATA:', e); 
    else console.log('Tüm şifreler 123 olarak kurtarıldı/onarlandı!');
  });
}
run();
"
```

## 3. Test Modu "Tüm Veritabanını Temizleme" [TEHLİKELİ]

> [!CAUTION]
> Bu komutu çalıştırmadan önce mutlaka yedekleme komutunu çalıştırınız. Veritabanı dosyası (`database.sqlite`) kalıcı olarak silinir ve NestJS yeniden başlarken (`synchronize: true`) tabloları sıfırdan ve bomboş biçimde oluşturur. Sadece test kullanıcıları yüklenir!

```bash
# Tam Sıfırlama ve Tablo Reset (Kullanıcı onayı zorunlu)
cd backend && del database.sqlite
```
