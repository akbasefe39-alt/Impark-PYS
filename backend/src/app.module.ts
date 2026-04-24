import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './auth/audit.interceptor';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventsGateway } from './events.gateway';
import { MailService } from './mail.service';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupService } from './backup.service';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';

import { User } from './user.entity';
import { Departman } from './departman.entity';
import { Izin } from './izin.entity';
import { Maas } from './maas.entity';
import { Mesai } from './mesai.entity';
import { Duyuru } from './duyuru.entity';
import { Zimmet } from './zimmet.entity';
import { Task } from './task.entity';
import { Expense } from './expense.entity';
import { ActivityLog } from './log.entity';
import { UserDocument } from './document.entity';
import { Notification } from './notification.entity';
import { PerformanceReview } from './performance.entity';
import { Message } from './message.entity'; // 💬 YENİ: Chat Tablosu
import { RecycleItem } from './recycle.entity'; // ♻️ YENİ: Çöp Kutusu
import { ChecklistItem } from './checklist.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      entities: [
        User,
        Departman,
        Izin,
        Maas,
        Mesai,
        Duyuru,
        Zimmet,
        Task,
        Expense,
        ActivityLog,
        UserDocument,
        Notification,
        PerformanceReview,
        Message,
        RecycleItem, // 🌟 YENİ TABLOLAR EKLENDİ
        ChecklistItem,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      User,
      Departman,
      Izin,
      Maas,
      Mesai,
      Duyuru,
      Zimmet,
      Task,
      Expense,
      ActivityLog,
      UserDocument,
      Notification,
      PerformanceReview,
      Message,
      RecycleItem, // 🌟 YENİ TABLOLAR EKLENDİ
      ChecklistItem,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRATION') || '7d') as any,
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120, // 🛠️ Canlı veri akışı ve yoğun kullanım için limit artırıldı
      },
    ]),


  ],
  controllers: [AppController, SecurityController],
  providers: [
    EventsGateway,
    MailService,
    AuthService,
    BackupService,
    SecurityService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
