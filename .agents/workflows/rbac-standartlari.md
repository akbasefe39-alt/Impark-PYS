---
description: Proje içindeki RBAC (Rol Tabanlı Erişim) hiyerarşisi ve yetki geliştirme konseptleri
---

# Rol Hiyerarşisi (RBAC) ve Sistem Kuralları

Bu proje katı bir Rol Tabanlı Erişim Kontrolü (RBAC) kullanır. Projeye yeni bir kod yazılırken veya mevcut bir modül güncellenirken aşağıdaki hiyerarşik yapı ve kurallar **KESİNLİKLE** dikkate alınmalıdır.

## 1. Rol Hiyerarşisi ve Tanımlamalar

- **Superadmin (Kurucu / Yönetim Kurulu):**
  - Sistemin "God Mode" (Sınırsız) yetkilisi.
  - Sadece Superadminler Sistem Loglarını, Geri Dönüşüm (Çöp Kutusu) verilerini silebilir veya geri yükleyebilir.
  - Şirket genelindeki tüm departman, maaş, zimmet, duyuru ve görevlere erişimi vardır. 

- **Admin (İnsan Kaynakları / Muhasebe / Operasyon Yöneticisi):**
  - Finans ve şirket genel operasyonlarını yürütür.
  - Maaşları ödeyebilir, zimmetleri atayabilir veya teslim alabilir, departmanları düzenleyebilir.
  - Sistem kritik ayarlarına (Çöp kutusu kurtarma, kalıcı silme) erişimi YOKTUR.

- **Yönetici (Departman / Birim Müdürü):**
  - Yatay izolasyona tabidir (Horizontal Privilege Access). Sadece KENDİ departmanına (kendisiyle aynı `departmanId` değerine sahip) atanan personelleri görebilir.
  - Departman dışı hiçbir personelin verisine (görevler, maaşlar, iletişim bilgileri) erişemez.
  - Sadece kendi departman personelinin izinlerini ve mesai saatlerini onaylayabilir/reddedebilir.

- **Personel (Standart Çalışan):**
  - Sadece KENDİ verisine (görevleri, izinleri, maaşları ve kişisel dokümanları) erişebilir.
  - Sistemin en kısıtlı rolüdür. Arayüzde hiçbir ekleme düğmesi ("Yeni Kayıt Ekle") veya silme butonu gösterilmemelidir (sadece görev durumlarını güncelleyebilir).

---

## 2. Geliştirme (Güvenlik) Kararları

- **Backend (NestJS) Mimarisi:** 
  Hiçbir Controller rotası, kullanıcının `userId` veya `departmanId` bilgisi doğrulanmadan veri döndüremez. Yöneticinin sisteme parametre dışı erişimini engellemek için `req.user` nesnesi kullanılacaktır. İstemciden (Frontend) gelen hiçbir rol bağımsız parametreye (güvenlik zincirinde) güvenilmeyecektir.
  
- **Frontend (React) Tasarım Kuralları:** 
  Arayüzde gösterilecek aksiyon öğeleri (Silme, Düzenleme, Onaylama butonları), bileşene geçirilen `isAdmin`, `isYonetici` bayraklarıyla *Kesin* filtrelenecektir. Arayüzde yetkisiz alanlar asla pasif (disabled) olarak gösterilmemeli, tamamen (null) yok edilmelidir (Gizlilik esası).

---

// turbo-all
## 3. Veritabanı Rol Doğrulama (DB Diagnostics Workflow)

Eğer projede rolleri denetlemek isterseniz aşağıdaki betiği (Node.js) çalıştırarak mevcut organizasyon şemasını doğrulayıp güncelleyebilirsiniz:

```bash
node -e "
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./backend/database.sqlite');
db.all(\"SELECT id, firstName, lastName, email, role, departmanId FROM user ORDER BY role ASC\", (err, rows) => {
    if (err) console.error(err);
    console.table(rows);
});
"
```
