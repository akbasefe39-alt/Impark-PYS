---
description: Kod Yazım, ESLint ve React/TypeScript Prensip/Standartları
---

# Kod Kalite ve Geliştirme Standartları

Tüm geliştiricilerin (Yapay Zeka ve İnsan) projenin genel yapısını temiz tutmak ve teknik borcu (technical debt) minimumda tutmak için uyması gereken zorunlu standartlar.

## 1. Backend (NestJS & TypeORM) Standartları

- **`any` Tipi Kesinlikle Yasak (No-Any Rule):** Yeni yazılacak veya düzeltilecek fonksiyonlarda TypeScript `any` tipinin kullanılması kesinlikle yasaktır. Gerekirse özel bir Interface veya DTO (Data Transfer Object) oluşturulacaktır. `Record<string, unknown>` veya özel Tipler (Types) kullanılmalıdır.
- **DTO Kullanımı:** `@Body()` parametrelerinde doğrudan nesne (`any`) almak yerine, her endpoint için `@nestjs/swagger` yeteneklerini kullanan sınıf tabanlı bir DTO oluşturulmalıdır. İş katmanında `class-validator` dekoratörleri çalıştırılmalıdır (Örn: `@IsString()`).
- **Promise Return:** Asenkron fonksiyonlarda (`async`) "floating promises" engellenmelidir. Her `await` uygun bir `catch` bloğu içine alınmalı ya da global exception filter'a bırakılmalıdır. Controller metotları her zaman spesifik bir `Promise<Type>` tipi dönmelidir.

## 2. Frontend (React & Vite) Standartları

- **ESLint Sıfır Tolerans:** `eslint .` çalıştırıldığında hiçbir Unused Variable (kullanılmayan değişken) veya eksik React Hook Dependency uyarısı kalmamalıdır. Kullanılmayan değişkenlerin (Örn. try-catch bloklarındaki `err` objesi) başına altçizgi (`_`) konarak yoksayılmamalı veya koddan çıkarılmalıdır.
- **Bileşen Parçalanması (Component Granularity):** 300 satırdan uzun bileşen (Örn. büyük bir sayfa yapısı) mutlaka mantıksal olarak (Hooks, Modal, Table Item) küçük fonksiyonel bileşenlere parçalanmalıdır.
- **Bağımlılık İzolasyonu:** Yalnızca `TailwindCSS` class'ları kullanılmalıdır. Bileşenlere "inline-style" (`style={{...}}`) vermek, kütüphaneden gelen kısıtlı bileşen tipleri (dinamik renk hesabı vs.) dışında YASAKTIR.

## 3. Kod Lint Kontrol Workflow'u

Eğer tüm dosyalarda `linting` işlemi gerçekleştirmek istiyorsanız bu bloğu çalıştırınız:

// turbo-all
```bash
# Frontend ESLint Kontrolü
cd frontend && npm run lint
```
```bash
# Backend ESLint Denetimi (Kuralların çiğnendiği yerleri arar)
cd backend && npm run lint
```
