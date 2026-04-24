import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../log.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(ActivityLog)
    private logRepo: Repository<ActivityLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;

    // Sadece veri değiştiren (POST, PUT, DELETE) istekleri logla
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      // Login ve Log/Çöp yönetimi işlemlerini loglamayalım
      if (url.includes('login') || url.includes('log-sil') || url.includes('logs-clear') || url.includes('recycle-empty')) {
        return next.handle();
      }

      return next.handle().pipe(
        tap(async () => {
          try {
            const response = context.switchToHttp().getResponse();
            const statusCode = response.statusCode;

            const log = new ActivityLog();
            log.method = method;
            log.url = url;
            log.payload = JSON.stringify(body || {});
            log.statusCode = statusCode;
            log.yapanKisi = user ? `${user.name || 'Bilinmeyen'}` : 'Sistem';
            log.tarih = new Date().toLocaleString('tr-TR');

            // İşlem tipini URL'den tahmin etmeye çalışalım
            log.islem = this.getFriendlyAction(method, url);

            await this.logRepo.save(log);
          } catch (e) {
            console.error(
              'Audit Loglama sırasında hata oluştu (Hata görmezden geliniyor):',
              e,
            );
          }
        }),
      );
    }

    return next.handle();
  }

  private getFriendlyAction(method: string, url: string): string {
    const isPost = method === 'POST';
    const isPut = method === 'PUT';
    const isDelete = method === 'DELETE';

    if (url.includes('login')) return 'Sisteme Giriş';
    if (url.includes('personel-guncelle')) return 'Personel Bilgisi Güncellendi';
    if (url.includes('register')) return 'Yeni Personel Kaydı Oluşturuldu';
    if (url.includes('bulk-import')) return 'Toplu Personel İçe Aktarımı Yapıldı';
    if (url.includes('izin-al')) return 'Yeni İzin Talebi Oluşturuldu';
    if (url.includes('izin-onay')) return 'İzin Talebi Durumu Güncellendi';
    if (url.includes('maas-ekle')) return 'Maaş Ödemesi Tanımlandı';
    if (url.includes('maas-odendi')) return 'Maaş Ödemesi Onaylandı';
    if (url.includes('mesai-baslat')) return 'Mesai Girişi Yapıldı';
    if (url.includes('mesai-bitir')) return 'Mesai Çıkışı Yapıldı';
    if (url.includes('zimmet-ekle')) return 'Yeni Zimmet Ataması Yapıldı';
    if (url.includes('zimmet-teslim-al')) return 'Zimmet İadesi Alındı / Silindi';
    if (url.includes('task-ekle')) return 'Yeni Görev Ataması Yapıldı';
    if (url.includes('task-guncelle')) return 'Görev Durumu Güncellendi';
    if (url.includes('expense-ekle')) return 'Yeni Harcama Talebi Oluşturuldu';
    if (url.includes('expense-onay')) return 'Harcama Talebi Onaylandı';
    if (url.includes('duyuru-ekle')) return 'Yeni Duyuru Yayınlandı';
    if (url.includes('document-ekle')) return 'Yeni Belge Arşive Eklendi';
    if (url.includes('departman-ekle')) return 'Yeni Departman Oluşturuldu';
    if (url.includes('checklist-ekle')) return 'Yeni Kontrol Listesi Maddesi Eklendi';
    if (url.includes('recycle-restore')) return 'Çöp Kutusundan Kayıt Geri Yüklendi';
    if (url.includes('recycle-empty')) return 'Çöp Kutusu Temizlendi';

    if (isDelete) return `Kayıt Silindi: ${url.split('/').pop()}`;
    
    return `${method} -> ${url}`;
  }
}
