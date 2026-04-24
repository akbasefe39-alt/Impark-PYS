import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Departman } from './departman.entity';
import { User } from './user.entity';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🛡️ GÜVENLİK: Hassas Verileri Gizle (@Exclude dekoratörlerini aktif et)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // 🛡️ GÜVENLİK: HTTP Başlıklarını Güvenli Hale Getir (Helmet)
  app.use(
    helmet({
      crossOriginResourcePolicy: false, // 🛠️ Geliştirme kolaylığı için (resimler vb. için)
    }),
  );

  // 🛡️ GÜVENLİK: Payload limitlerini makul seviyeye çek (5mb)
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ limit: '5mb', extended: true }));

  // ✨ KODLAMA: Tüm yanıtlara UTF-8 charset header'ı ekle (Türkçe karakter sorunu için)
  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  // 🛡️ GÜVENLİK: Global Doğrulama Pipe'ı
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO dışındaki alanları temizle
      forbidNonWhitelisted: true, // Bilinmeyen alan gelirse hata ver
      transform: true, // Otomatik tip dönüşümü (id: string -> number vb.)
    }),
  );

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost',
      'http://127.0.0.1:5173',
      'http://[::1]:5173',
    ].filter(Boolean),
    credentials: true,
  });

  const depRepo = app.get(getRepositoryToken(Departman));
  const userRepo = app.get(getRepositoryToken(User));

  // 1. Departmanları Hazırla
  let yazilimDep = await depRepo.findOne({ where: { ad: 'Yazılım' } as any });
  if (!yazilimDep) {
    yazilimDep = await depRepo.save({ ad: 'Yazılım' });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Sunucu ${port} portunda (0.0.0.0) çalışıyor...`);

}
bootstrap();
