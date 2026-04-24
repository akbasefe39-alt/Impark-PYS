# 🏢 ERP CORE - Personel Yönetim Sistemi (PYS)

ERP Core, şirket içi personel, finans, operasyon ve insan kaynakları süreçlerini merkezi olarak yönetmeyi sağlayan yeni nesil, yapay zeka destekli bir yönetim paneli (ERP) projesidir.

## 🛠 Kullanılan Teknolojiler

**Frontend (Kullanıcı Arayüzü):**
- **Mimari:** React.js (Vite ile oluşturulmuş)
- **Stil & UI:** TailwindCSS, Lucide-React (İkonlar)
- **Grafik & Görselleştirme:** Recharts (PieChart, BarChart, LineChart)
- **Ağ İstekleri:** Axios (Yetkilendirme interceptor'ları ile)

**Backend (Sunucu ve Veritabanı):**
- **Mimari:** NestJS (Node.js framework)
- **Veritabanı:** SQLite (TypeORM kullanılarak yapılandırılmış)
- **Güvenlik & Yetkilendirme:** JWT (JSON Web Tokens), Passport, bcrypt (Şifre hashleme)
- **Yapay Zeka:** `@google/generative-ai` (Gemini 2.5 Flash entegrasyonu ile yapay zeka asistanı ve performans analizi)

---

## 🔑 Kullanıcı Rolleri ve Erişim Mimarisi (RBAC+)

Sistem, **Granüler (Hassas) Yetki Tabanlı Erişim (RBAC+)** mimarisi kullanır. Klasik rol tabanlı sistemin ötesinde, her kullanıcıya bireysel yetki bayrakları atanabilir:

### Roller
1. **Superadmin / Admin:** Tüm modüllere tam yetkiyle erişir. Tüm yetki bayrakları (`canManagePersonnel`, `canManageFinance`, `canApproveLeaves`, `canManageInventory`, `canViewLogs`) backend tarafından otomatik olarak `true` (aktif) yapılır. Yetki tablosunda bu bayraklar kilitli ve işaretli görünür.
2. **Yönetici (Departman Yöneticisi):** Kendi departmanındaki personelin verilerine, mesai ve izin taleplerine erişebilir & onaylayabilir. İzin onaylama yetkisi (`canApproveLeaves`) otomatik aktiftir.
3. **Personel:** Sadece kendi kişisel bilgilerini, görevlerini, maaşlarını, izinlerini ve zimmetlerini görebilir.

### Granüler Yetki Bayrakları
| Bayrak | Açıklama |
|---|---|
| `canViewDashboard` | Ana paneli (Dashboard) görme yetkisi |
| `canManagePersonnel` | Personel ekleme, düzenleme, silme |
| `canManageFinance` | Maaş ve bordro yönetimi |
| `canApproveLeaves` | İzin taleplerini onaylama/reddetme |
| `canManageInventory` | Zimmet atama ve iade yönetimi |
| `canViewLogs` | Sistem denetim loglarını görüntüleme |

> **Teknik Not:** Admin/Superadmin rolleri için tüm bayraklar JWT oluşturma (`login`), kayıt (`register`) ve güncelleme (`updateUser`) aşamalarında backend tarafından zorla `true` yapılır.

---

## ⚡ Temel Sistem Modülleri

- **📊 Dashboard (Özelleştirilebilir Widget Paneli):** Personel sayısı, aktif birimler, aylık maaş gideri, departman grafik verileri ve bekleyen taleplerin özetlendiği analiz ekranı. **Kullanıcılar "Görünümü Düzenle" butonu ile hangi widget'ların (istatistik kartları ve grafikler) görüneceğini seçebilir.** Tercihler veritabanında kullanıcı bazlı saklanır (`dashboardLayout`).
- **👥 Personel Dosyası:** Personel kayıtları, unvanlar, çalışma saatleri, sözleşme verileri. Katı Grid tablo formatı.
- **🏢 Departman (Birim) Yönetimi:** Şirket içi birimlerin tanımlanması ve personellerle ilişkilendirilmesi.
- **🔑 Yetki & Rol Yönetimi:** Çalışanların ünvan, departman, sistem rolü ve granüler yetki bayraklarının düzenlendiği kontrol modülü. Admin/Superadmin için yetkiler kilitli ve otomatik aktif görünür.
- **🕒 İzin Yönetimi:** Personelin izin talebi oluşturması ve yöneticilerin bu talepleri onaylaması/reddetmesi.
- **⏱ Mesai / PDKS:** Günlük giriş/çıkış saatlerinin izlenmesi ve ekstra mesai hakedişlerinin hesaplanması.
- **📋 Görev Akışı (Kanban/Görevler):** Personellere görev atanması, "Beklemede/Yapılıyor/Tamamlandı" durumlarıyla takip edilmesi.
- **💸 Harcamalar:** Personel masraflarının kaydedilip onaylanarak finans havuzuna aktarılması.
- **💰 Maaş Ödemeleri:** Personel temel maaş ve primlerinin sistemden oluşturularak ödendi/bekliyor statüsüyle yönetilmesi. PDF bordro indirme özelliği mevcuttur.
- **💻 Zimmet Dosyaları:** Personele verilen şirket donanımlarının/araçlarının kaydedilmesi.
- **🗂 Belge Arşivi:** Personel özlük dosyalarının (sözleşme vb.) dijital kopyalarının sistemde tutulması.
- **📢 Duyuru Panosu:** Kritik bildirimlerin tüm şirkete yayınlanması, okundu/okunmadı (read/unread) mekanizmasıyla okunma durumlarının takibi.
- **✅ İşe Giriş/Çıkış (Onboarding/Offboarding):** Yeni personel için oryantasyon ve işten çıkış süreçlerinin adım adım takip edildiği kontrol listeleri (Checklist) modülü.
- **📜 Sistem Logları:** Tüm kullanıcı işlemlerinin, yapıldığı anın ve kişinin kaydedildiği değişmez denetim defteri (Audit Log). Log detayları güvenli JSON görüntüleyici ile incelenebilir.
- **🗑 Geri Dönüşüm Kutusu:** Yanlışlıkla silinen (Personel, Görev, Zimmet, Belge vb.) verilerin kalıcı silinmeden önce kurtarılabildiği koruma modülü.

---

## 🤖 Yapay Zeka Entegrasyonları (Cognitive Analyst)

Sistem içerisinde yerleşik bir Gemini AI akıllı motoru bulunmaktadır:
1. **AI Copilot (Akıllı Asistan):** Ekranın sol altından erişilen Discord-tarzı menüde yöneticiler şirket verileri ("Kimler izinde?", "Maaş yükü nedir?", "Geciken görev var mı?") hakkında AI ile anlık, doğal dilde sohbet edebilir.
2. **Performans Analizi:** Sistem, personelin zamanında tamamladığı görevlerini, mesai çıkışlarını ve diğer verilerini işleyip AI yardımıyla bir "Çalışan Performans Skoru" (Örn: "Şirket Yıldızı", "Hızlı Çözücü") atar.
3. **Çevrimdışı Yedek Zeka:** API kotası aşıldığında veya model hatası alındığında sistem, kendi iç zekası (fallback) ile bütçe, risk ve izin konularında cevap üretebilir.

---

## 🧩 Frontend Bileşen Mimarisi

| Bileşen | Dosya | Açıklama |
|---|---|---|
| Ana Uygulama | `App.jsx` | Tüm modüllerin render edildiği, state yönetiminin yapıldığı ana bileşen |
| Sol Menü | `MenuDrawer.jsx` | Rol ve yetki bazlı sekme filtreleme ile navigasyon |
| Üst Başlık | `MainHeader.jsx` | Arama, bildirimler, profil ve dil değiştirme |
| Kayıt Formu | `Drawer.jsx` | Sağdan açılan çekmece ile yeni kayıt ekleme (15+ form tipi) |
| Profil Düzenleyici | `EditModal.jsx` | Personel profil detayları ve düzenleme modalı |
| Dashboard Widget'ları | `DashboardWidgets.jsx` | Modüler istatistik kartları ve grafik bileşenleri |
| Panel Özelleştirici | `DashboardCustomizer.jsx` | Widget aç/kapat ve düzen kaydetme arayüzü |
| AI Sohbet | `ChatDock.jsx` | AI Copilot ve canlı mesajlaşma paneli |
| Bildirimler | `Popups.jsx` | Toast bildirimleri ve duyuru popup'ları |
| UI Atomları | `Button.jsx`, `Input.jsx`, `Select.jsx`, `EmptyState.jsx` | Tekrar kullanılabilir temel UI bileşenleri |

---

## 🗃 Backend Entity (Veritabanı Tablo) Yapısı

| Entity | Dosya | Açıklama |
|---|---|---|
| `User` | `user.entity.ts` | Personel bilgileri, rol, yetki bayrakları, dashboard tercihleri |
| `Departman` | `departman.entity.ts` | Birim tanımları |
| `Izin` | `izin.entity.ts` | İzin talepleri ve onay durumları |
| `Maas` | `maas.entity.ts` | Maaş ve prim kayıtları |
| `Mesai` | `mesai.entity.ts` | Giriş/çıkış saatleri |
| `Task` | `task.entity.ts` | Görev atamaları |
| `Expense` | `expense.entity.ts` | Harcama kayıtları |
| `Zimmet` | `zimmet.entity.ts` | Zimmet dosyaları |
| `UserDocument` | `document.entity.ts` | Belge arşivi |
| `Duyuru` | `duyuru.entity.ts` | Duyurular |
| `ActivityLog` | `log.entity.ts` | Denetim logları |
| `Notification` | `notification.entity.ts` | Kullanıcı bildirimleri |
| `PerformanceReview` | `performance.entity.ts` | AI performans değerlendirmeleri |
| `Message` | `message.entity.ts` | Canlı sohbet mesajları |
| `RecycleItem` | `recycle.entity.ts` | Geri dönüşüm kutusu kayıtları |
| `ChecklistItem` | `checklist.entity.ts` | Onboarding/Offboarding kontrol listeleri |

---

## 🚀 Başlatma Anahtarı (Kurulum & Kullanım)

1. **Bağımlılıkları Yükleme:**
   Hem `frontend` hem de `backend` klasörleri içinde terminalde:
   ```bash
   npm install
   ```
2. **Projeyi Başlatma:**
   - **Veritabanı / Sunucu:** `backend` dizininde `npm run start:dev`
   - **Arayüz:** `frontend` dizininde `npm run dev`
3. **Varsayılan Giriş:** Sistem başlatıldığında eğer hiç `superadmin` hesabı yoksa otomatik olarak bir superadmin hesabı oluşturulur:
   - **E-posta:** `superadmin@test.com`
   - **Şifre:** `123`

> **Not:** Eski sürümlerde bulunan otomatik test hesabı oluşturma (seeder) döngüsü kaldırılmıştır. Yeni personel ve hesaplar artık sadece yönetici paneli üzerinden manuel olarak eklenir.

---

## 📋 Son Güncellemeler (v2.x)

- **RBAC+ Granüler Yetkilendirme:** Klasik rol tabanlı sistemden, bireysel yetki bayraklı mimariye geçiş tamamlandı.
- **Admin Tam Erişim Garantisi:** Admin/Superadmin rolleri için tüm yetki bayrakları JWT, veritabanı ve UI seviyesinde otomatik aktif.
- **Özelleştirilebilir Widget Dashboard:** Kullanıcılar ana paneldeki istatistik kartlarını ve grafikleri kişiselleştirebilir; tercihler veritabanında saklanır.
- **İşe Giriş/Çıkış (Onboarding/Offboarding):** Yeni personel oryantasyonu ve işten çıkış süreçleri için kontrol listesi modülü eklendi.
- **Log Detay Güvenliği:** Denetim loglarının payload verisi güvenli JSON parse ile görüntülenir; hatalı veri durumunda sistem çökmez.
- **Seeder Temizliği:** Silinen personellerin sunucu yeniden başlatılınca tekrar oluşmasına sebep olan otomatik hesap oluşturma kodu kaldırıldı.

> *Bu doküman, teknik veya iş birimi paydaşlarına PYS projesini hızlı şekilde tanıtmak amacıyla mümkün olan en az gereksiz detay ile oluşturulmuştur.*
