# 📋 PYS ERP - Kapsamlı Sistem Dokümantasyonu & Özellik Kataloğu

> **Versiyon:** 1.0 (Stable)  
> **Son Güncelleme:** 22 Nisan 2026  
> **Durum:** Üretim Ortamına Hazır (Production Ready)

---

## 🔐 1. Güvenlik & Erişim Kontrolü
Sistem, kurumsal standartlarda çok katmanlı bir güvenlik mimarisine sahiptir:
- **Çok Faktörlü Doğrulama (MFA/2FA)**: Giriş işlemlerinde e-posta üzerinden 6 haneli geçici güvenlik kodu doğrulaması.
- **Gelişmiş Bot Koruması**: 3 hatalı denemeden sonra otomatik devreye giren Metin (Text) tabanlı Captcha sistemi.
- **JWT Hardening**: Kullanıcı verilerinin (Kişisel notlar vb.) token içinde değil, sunucu tarafında güvenli saklanması.
- **Entity Protection**: Şifre hash'lerinin ve hassas verilerin API yanıtlarından otomatik olarak dışlanması (Exclude).
- **PII Maskeleme**: KVKK uyumu için yöneticilerin diğer personellerin TC No ve IBAN bilgilerini görmesinin engellenmesi (Maskelenmiş görünüm).
- **Otomatik SQL/XSS Taraması**: Veritabanı içeriğini zararlı kodlara karşı periyodik olarak tarayan dahili Güvenlik Merkezi.
- **Audit Logging (Denetim İzi)**: Sistemdeki her veri değişikliğinin (Eski Değer -> Yeni Değer) kullanıcı ve zaman bazlı kaydedilmesi.
- **DB Yedekleme**: Her gece 00:00'da veritabanının otomatik yedeklenmesi ve son 7 günlük yedeğin saklanması.

---

## 👥 2. Personel & Organizasyon Yönetimi
- **Tam Özlük Dosyası**: İletişim, banka (IBAN), kimlik, adres ve eğitim bilgilerinin detaylı takibi.
- **Departman Yönetimi**: Şirket hiyerarşisine uygun departman tanımlama ve personel atama.
- **Excel Toplu İçe Aktarma**: Yüzlerce personeli tek bir Excel/CSV dosyasıyla saniyeler içinde sisteme ekleme.
- **Dijital Personel Kartı**: Tek tıkla resmi formatta PDF Personel Kimlik Kartı oluşturma.
- **Arşiv & Çöp Kutusu**: Silinen personellerin gerçek veriden ayrılıp 7 gün boyunca "Geri Dönüşüm" kutusunda saklanması.

---

## 🏖️ 3. İzin & Mesai (PDKS) Yönetimi
- **Çok Aşamalı Onay Akışı**: Personel -> Birim Yöneticisi -> Genel Admin hiyerarşisinde izin onay süreci.
- **Yıllık İzin Hakediş Motoru**: İşe giriş tarihine göre (1-5 yıl: 14 gün vb.) otomatik izin hakediş ve kalan gün hesabı.
- **Görsel İzin Takvimi**: Kimlerin hangi tarihte izinli olduğunun takvim üzerinde departman bazlı izlenmesi.
- **Resmi İzin Formu (PDF)**: Onaylanan izinlerin resmi ıslak imza formatında PDF raporunun alınması.
- **PDKS Mesai Takibi**: Giriş/Çıkış saatlerinin kaydı ve otomatik fazla mesai ücreti hesaplama motoru.

---

## 💰 4. Finans & Demirbaş Yönetimi
- **Maaş & Bordro Paneli**: Brüt, Net ve Prim bazlı maaş yönetimi ve ödeme durumu takibi.
- **PDF Bordro Üretimi**: Personel bazlı aylık maaş hakedişlerinin PDF formatında dökümü.
- **Çok Adımlı Masraf Onayı**: Personelin yüklediği harcama taleplerinin yönetici ve finans bazlı onaylanması.
- **Zimmet & Demirbaş Takibi**: Şirket varlıklarının (Laptop, Telefon, Araç) seri no bazlı personele atanması ve tarihçesi.

---

## 🧠 5. AI (Yapay Zeka) & Analiz Yetenekleri
- **AI Copilot (Gemini Pro)**: Sisteme entegre edilen yapay zeka ile "Şu an kaç kişi izinli?", "Gelecek ayki toplam maaş yükü ne olur?" gibi sorulara doğal dilde yanıt alma.
- **AI Performans Tahmini**: Personel verilerinden (izin, mesai, görev tamamlama) yola çıkarak performans skoru üretme.
- **Dinamik Dashboard**: Sürüklenebilir widget'lar ile (Grafikler, Notlar, İstatistikler) her kullanıcının kendi ana sayfasını tasarlayabilmesi.

---

## 📢 6. İletişim & İş Akışı
- **Zengin Duyuru Sistemi**: Görsel ve zengin metin (Rich Text) destekli duyuru yayınlama ve "Okundu" takibi.
- **Anlık Bildirimler**: Sayfa yenilemeden yeni görev, izin onayı veya harcama mesajlarını Socket.io ile anlık alma.
- **Görev Yönetimi (Kanban)**: Personellere görev atama, son teslim tarihi takibi ve durum (Todo, Doing, Done) yönetimi.
- **Belge Arşivi**: Diploma, Kimlik fotokopisi, Sözleşme gibi belgelerin personel bazlı bulut depolaması.

---

## 🎨 7. Modern Arayüz & Teknik Altyapı
- **Karanlık Mod (Dark Mode)**: Göz yormayan, premium gece teması desteği.
- **Responsive (Mobil Uyum)**: Tüm ekranlarda (Telefon, Tablet, TV) kusursuz çalışan esnek tasarım.
- **Yüksek Performans**: SQLite veritabanı ve TypeORM ile hızlı veri işleme mimarisi.
- **Modern Font Sistemi**: Apple ve Google standartlarında `Inter` fontu ile kusursuz Türkçe karakter desteği.

---

## 📝 Sonuç
PYS ERP, sadece bir personel takip yazılımı değil; güvenlik, yapay zeka ve kurumsal verimliliği odağına alan **bütünleşik bir dijital yönetim platformudur.**
