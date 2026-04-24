# 🚀 PYS ERP Canlıya Geçiş Rehberi (Production Guide)

Bu rehber, PYS ERP projesinin Docker konteynerleri kullanılarak veya manuel olarak canlı sunucuya nasıl kurulacağını ve yönetileceğini anlatır.

## 🐳 1. Docker ile Kurulum (Önerilen)

Proje, Docker ve Docker Compose ile tam uyumlu hale getirilmiştir. Bu yöntem, bağımlılık çakışmalarını önler ve kurulumu standartlaştırır.

### Kurulum Adımları:
1.  **Docker Yükleyin:** Sunucunuzda Docker ve Docker Compose'un kurulu olduğundan emin olun.
2.  **Yapılandırma:** `backend/.env` ve `frontend/.env` dosyalarını sunucu adreslerinize göre düzenleyin.
3.  **Başlatma:** Ana dizinde şu komutu çalıştırın:
    ```bash
    docker-compose up --build -d
    ```
4.  **Kontrol:** Konteynerlerin durumunu kontrol edin:
    ```bash
    docker ps
    ```

### Docker Avantajları:
- **Otomatik Bellek Yönetimi:** Frontend build işlemi için gerekli 4GB RAM sınırı Docker imajı içinde otomatik olarak ayarlanmıştır.
- **Sürücü Uyumluluğu:** `better-sqlite3` sürücüsü Docker ortamında derlenmiş ve optimize edilmiştir.
- **Kalıcılık (Persistence):** Veritabanı (`database.sqlite`) ve yüklenen dosyalar (`uploads`) host makinesindeki klasörlerle eşlenerek konteyner silinse bile korunur.

---

## 📦 2. Manuel Kurulum (Alternatif)

Eğer Docker kullanmıyorsanız, aşağıdaki adımları takip edin:

### Backend (NestJS)
1.  **Node.js 20+** kurulu olduğundan emin olun.
2.  Bağımlılıkları yükleyin: `npm install --legacy-peer-deps`
3.  Derleyin: `npm run build`
4.  Çalıştırın: `pm2 start dist/main.js --name "pys-backend"`

### Frontend (React/Vite)
1.  Derleyin (Hafıza hatası almamak için):
    ```bash
    set NODE_OPTIONS=--max-old-space-size=4096 && npm run build
    ```
2.  Oluşan `dist` klasörünü Nginx/Apache sunucunuza yükleyin.

---

## 🛠 3. Ortam Değişkenleri (Environment)

### Backend (`/backend/.env`)
- `PORT`: 3000 (Docker kullanıyorsanız Docker Compose içinden yönetilir).
- `FRONTEND_URL`: Kullanıcıların arayüze erişeceği adres.
- `JWT_SECRET`: Çok güçlü bir gizli anahtar.
- `GOOGLE_GENAI_API_KEY`: AI özellikleri için gerekli anahtar.

### Frontend (`/frontend/.env`)
- `VITE_API_URL`: Backend API'nizin dışarıdan erişilebilir adresi.

---

## 🔄 4. Güncelleme ve Bakım

1.  **Yedekleme:** `backend/backups` klasörü otomatik yedekleri içerir. Bu klasörü düzenli olarak harici bir konuma kopyalayın.
2.  **Güncelleme:** Kod değişikliklerinden sonra Docker konteynerlerini yeniden derleyin:
    ```bash
    docker-compose up --build -d
    ```
3.  **Log Takibi:** Hata ayıklama için:
    ```bash
    docker logs -f pys-backend
    ```

## 🛡️ 5. Kritik Güvenlik Notları
- Canlı sunucuda **HTTPS/SSL** kullanımı zorunludur.
- `.env` dosyalarını asla genel erişime açmayın.
- Varsayılan `admin` parolasını ilk girişte mutlaka değiştirin.
