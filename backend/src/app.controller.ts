import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Put,
  UnauthorizedException,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Request,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { Message } from './message.entity';
import { RecycleItem } from './recycle.entity';
import { ChecklistItem } from './checklist.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { EventsGateway } from './events.gateway';
import { AuthService } from './auth.service';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { sanitizeRichText, sanitizeSimpleText } from './sanitize.utils';
import { MailService } from './mail.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class AppController implements OnModuleInit {
  constructor(
    private eventsGateway: EventsGateway,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Departman) private depRepo: Repository<Departman>,
    @InjectRepository(Izin) private izinRepo: Repository<Izin>,
    @InjectRepository(Maas) private maasRepo: Repository<Maas>,
    @InjectRepository(Mesai) private mesaiRepo: Repository<Mesai>,
    @InjectRepository(Duyuru) private duyuruRepo: Repository<Duyuru>,
    @InjectRepository(Zimmet) private zimmetRepo: Repository<Zimmet>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
    @InjectRepository(ActivityLog) private logRepo: Repository<ActivityLog>,
    @InjectRepository(UserDocument) private docRepo: Repository<UserDocument>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(PerformanceReview)
    private perfRepo: Repository<PerformanceReview>,
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @InjectRepository(RecycleItem) private recycleRepo: Repository<RecycleItem>,
    @InjectRepository(ChecklistItem)
    private checkRepo: Repository<ChecklistItem>,
    private jwtService: JwtService,
    private authService: AuthService,
    private mailService: MailService,
  ) {}

  async onModuleInit() {
    // Superadmin otomatik oluşturma mantığı kaldırıldı (Müşteri Talebi: Tek admin admin@test.com olmalı)
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Post('verify-mfa')
  async verifyMfa(@Body() body: any) {
    return this.authService.verifyMfa(body.tempToken, body.code);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Put('update-profile/:id')
  async updateProfile(
    @Param('id') id: number,
    @Body() body: UpdateUserDto,
    @Request() req: any,
  ) {
    const requesterId = Number(req.user.sub);
    const targetId = Number(id);
    
    // 🛡️ IDOR KONTROLÜ: Kullanıcı sadece kendi profilini güncelleyebilir (Admin/Superadmin değilse)
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'superadmin' &&
      requesterId !== targetId
    ) {
      throw new UnauthorizedException(
        'Kendi profiliniz dışındaki profilleri güncelleyemezsiniz!',
      );
    }

    const user = await this.userRepo.findOne({ where: { id: targetId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    const updateData: any = {};
    if (body.firstName) updateData.firstName = body.firstName;
    if (body.lastName) updateData.lastName = body.lastName;
    if (body.email) updateData.email = body.email;
    if (body.profilePicture) updateData.profilePicture = body.profilePicture;
    
    if (body.password && body.password.trim() !== '') {
      updateData.password = await bcrypt.hash(body.password, 10);
      updateData.mustChangePassword = false;
    }

    if (body.tcKimlikNo !== undefined) updateData.tcKimlikNo = body.tcKimlikNo;
    if (body.telefon !== undefined) updateData.telefon = body.telefon;
    if (body.dogumTarihi !== undefined) updateData.dogumTarihi = body.dogumTarihi;
    if (body.kanGrubu !== undefined) updateData.kanGrubu = body.kanGrubu;
    if (body.medeniHal !== undefined) updateData.medeniHal = body.medeniHal;
    if (body.cinsiyet !== undefined) updateData.cinsiyet = body.cinsiyet;
    if (body.acilDurumKisisi !== undefined) updateData.acilDurumKisisi = body.acilDurumKisisi;
    if (body.acilDurumTelefonu !== undefined) updateData.acilDurumTelefonu = body.acilDurumTelefonu;
    if (body.mezuniyet !== undefined) updateData.mezuniyet = body.mezuniyet;
    if (body.adres !== undefined) updateData.adres = body.adres;
    if (body.sgkNo !== undefined) updateData.sgkNo = body.sgkNo;
    if (body.vergiNo !== undefined) updateData.vergiNo = body.vergiNo;
    if (body.iban !== undefined) updateData.iban = body.iban;
    if (body.ehliyetSinifi !== undefined) updateData.ehliyetSinifi = body.ehliyetSinifi;
    if (body.askerlikDurumu !== undefined) updateData.askerlikDurumu = body.askerlikDurumu;
    if (body.sozlesmeTipi !== undefined) updateData.sozlesmeTipi = body.sozlesmeTipi;
    if (body.uyruk !== undefined) updateData.uyruk = body.uyruk;

    if (body.mfaEnabled !== undefined) {
      updateData.mfaEnabled = body.mfaEnabled;
    }

    // Audit Loglar (Self update)
    const oldData = JSON.stringify({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mfaEnabled: user.mfaEnabled
    });

    await this.userRepo.update(id, updateData);
    
    const updatedUser = await this.userRepo.findOne({ where: { id: targetId } });
    const newData = JSON.stringify({
      firstName: updatedUser?.firstName,
      lastName: updatedUser?.lastName,
      email: updatedUser?.email,
      mfaEnabled: updatedUser?.mfaEnabled
    });

    await this.logRepo.save({
      islem: `Profil guncellendi: ${user.firstName} ${user.lastName}`,
      yapanKisi: req.user?.name || user.email,
      tarih: new Date().toLocaleString('tr-TR'),
      entityName: 'User',
      entityId: String(id),
      oldData,
      newData,
    });

    return { success: true };
  }

  @Get('notifications/:userId')
  async getNotifs(@Param('userId') userId: number, @Request() req: any) {
    // 🛡️ IDOR KONTROLÜ: Sadece kendi bildirimlerini görebilir (Adminler hariç)
    if (
      req.user.role !== 'admin' &&
      req.user.sub !== Number(userId)
    ) {
      throw new UnauthorizedException(
        'Başka bir kullanıcının bildirimlerini göremezsiniz!',
      );
    }
    return this.notifRepo.find({
      where: { user: { id: Number(userId) } as any },
      order: { id: 'DESC' } as any,
      take: 10,
    });
  }

  @Put('notifications-read/:id')
  async readNotif(@Param('id') id: number, @Request() req: any) {
    const notif = await this.notifRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!notif) throw new NotFoundException('Bildirim bulunamadı');
    
    // 🛡️ IDOR KONTROLÜ: Sadece kendi bildirimini okundu yapabilir
    if (notif.user.id !== Number(req.user.sub)) {
      throw new UnauthorizedException('Bu bildirim size ait değil!');
    }
    
    return this.notifRepo.update(id, { isRead: true });
  }

  private async createNotification(
    userId: number,
    title: string,
    message: string,
  ) {
    if (!userId) return;
    await this.notifRepo.save({
      title,
      message,
      date: new Date().toLocaleString('tr-TR'),
      user: { id: userId } as any,
      isRead: false,
    });
  }

  @Roles('admin', 'yonetici')
  @Get('stats')
  async getStats() {
    try {
      const totalUsers = await this.userRepo.count();
      const totalDeps = await this.depRepo.count();
      const pendingIzins = await this.izinRepo.count({
        where: { durum: 'Beklemede' } as any,
      });
      const maaslar = (await this.maasRepo.find()) || [];
      const deps = (await this.depRepo.find({ relations: ['personeller'] })) || [];
      
      const totalBudget = maaslar.reduce(
        (sum, m) => sum + (Number(m.temelMaas) || 0) + (Number(m.prim) || 0),
        0,
      );

      return {
        totalUsers,
        totalDeps,
        pendingIzins,
        chartData: deps.map((d) => ({
          name: d.ad || 'Bilinmiyor',
          value: d.personeller?.length || 0,
        })),
        totalBudget,
      };
    } catch (err) {
      console.error("STATS ERROR:", err);
      // Hata durumunda sistemin çökmemesi için en azından temel sayıları dönmeye çalışalım
      return { totalUsers: 0, totalDeps: 0, pendingIzins: 0, chartData: [], totalBudget: 0 };
    }
  }

  @Roles('admin', 'yonetici')
  @Get()
  async findAll(@Request() req: any) {
    // 🛡️ YATAY YETKİ KONTROLÜ: Yönetici sadece kendi departmanını görebilir
    const queryOptions: any = {
      relations: [
        'departman',
        'izinler',
        'mesailer',
        'zimmetler',
        'belgeler',
        'gorevler',
        'harcamalar',
      ],
    };

    if (req.user.role === 'admin') {
      // Admin tam erişim, filtreleme yok
    } else if (req.user.role === 'yonetici' && req.user.departmanId) {
      queryOptions.where = { departman: { id: req.user.departmanId } };
    } else if (req.user.role === 'personel') {
      queryOptions.where = { id: req.user.sub };
    }

    const users = await this.userRepo.find(queryOptions);
    return users.map((user) => {
      const isGiris = new Date(user.iseGirisTarihi || new Date());
      const bugun = new Date();
      const farkGun = Math.floor(
        (bugun.getTime() - isGiris.getTime()) / (1000 * 60 * 60 * 24),
      );
      const kidemYili = Math.floor(farkGun / 365);

      let toplamHakedilenIzin = 0;
      for (let i = 1; i <= kidemYili; i++) {
        if (i >= 1 && i <= 5) toplamHakedilenIzin += 14;
        else if (i > 5 && i < 15) toplamHakedilenIzin += 20;
        else if (i >= 15) toplamHakedilenIzin += 26;
      }

      const kullanilanYillikIzin = (user.izinler || []).reduce((sum, i) => {
        if (i.durum === 'Onaylandı' && i.izinTuru === 'Yıllık İzin') {
          const bas = new Date(i.baslangicTarihi);
          const bit = new Date(i.bitisTarihi);
          const sure =
            Math.floor(
              (bit.getTime() - bas.getTime()) / (1000 * 60 * 60 * 24),
            ) + 1;
          return sum + sure;
        }
        return sum;
      }, 0);

      const nSaat = user.normalCalismaSaati || 8;
      const sUcret = user.saatlikUcret || 0;
      const hakedis =
        (user.mesailer || []).reduce(
          (sum, m) =>
            sum + (m.toplamCalisma > nSaat ? m.toplamCalisma - nSaat : 0),
          0,
        ) * sUcret;

      // 🛡️ GİZLİLİK (PII MASKING): Sadece Admin tüm detayları görebilir
      // Yöneticiler TC No ve IBAN gibi hassas verileri göremez
      const isFullAdmin = req.user.role === 'admin';
      
      return {
        ...user,
        tcKimlikNo: isFullAdmin ? user.tcKimlikNo : '***',
        iban: isFullAdmin ? user.iban : '***',
        telefon: isFullAdmin ? user.telefon : (user.telefon ? user.telefon.substring(0, 5) + '***' : null),
        kalanIzin: toplamHakedilenIzin - kullanilanYillikIzin,
        toplamHakedilenIzin: toplamHakedilenIzin,
        hakedilenMesaiUcreti: Math.round(hakedis),
      };
    });
  }

  @Post('bulk-import')
  async bulkImport(@Body() body: any[]) {
    const results: any[] = [];
    for (const item of body) {
      try {
        const hashedPassword = await bcrypt.hash('123', 10);
        const user = this.userRepo.create({
          firstName: item.firstName || item.Ad || 'Isim',
          lastName: item.lastName || item.Soyad || 'Soyisim',
          email:
            item.email ||
            item.Email ||
            `user${Math.floor(Math.random() * 10000)}@pys.com`,
          password: hashedPassword,
          mustChangePassword: true,
          role: 'personel',
          unvan: item.unvan || item.Unvan || 'Personel',
          iseGirisTarihi:
            item.iseGirisTarihi ||
            item.IseGiris ||
            new Date().toISOString().split('T')[0],
          toplamIzinHakki: Number(item.toplamIzinHakki || 14),
          tcKimlikNo: String(item.tcKimlikNo || item.TC || ''),
          telefon: String(item.telefon || item.Telefon || ''),
          dogumTarihi: String(item.dogumTarihi || item.DogumTarihi || ''),
          kanGrubu: String(item.kanGrubu || item.KanGrubu || ''),
          medeniHal: String(item.medeniHal || item.MedeniHal || ''),
          cinsiyet: String(item.cinsiyet || item.Cinsiyet || ''),
          acilDurumKisisi: String(item.acilDurumKisisi || item.AcilDurumKisisi || ''),
          acilDurumTelefonu: String(item.acilDurumTelefonu || item.AcilDurumTelefonu || ''),
          mezuniyet: String(item.mezuniyet || item.Mezuniyet || ''),
          adres: String(item.adres || item.Adres || ''),
          sgkNo: String(item.sgkNo || item.SGK || ''),
          vergiNo: String(item.vergiNo || item.VergiNo || ''),
          iban: String(item.iban || item.IBAN || ''),
          ehliyetSinifi: String(item.ehliyetSinifi || item.Ehliyet || ''),
          askerlikDurumu: String(item.askerlikDurumu || item.Askerlik || ''),
          sozlesmeTipi: String(item.sozlesmeTipi || item.Sozlesme || ''),
          uyruk: String(item.uyruk || item.Uyruk || ''),
          normalCalismaSaati: Number(item.normalCalismaSaati || 8),
          saatlikUcret: Number(item.saatlikUcret || 0),
          gunlukUcret: Number(item.gunlukUcret || 0),
        });
        await this.userRepo.save(user);
        results.push({ email: user.email, success: true });
      } catch (e) {
        results.push({
          email: item.email || 'unknown',
          success: false,
          error: e.message,
        });
      }
    }
    return results;
  }

  @Roles('admin')
  @Post('register')
  async register(@Body() body: CreateUserDto) {
    if (!body.firstName || !body.email || !body.password)
      throw new BadRequestException('Eksik bilgi.');

    const exists = await this.userRepo.findOne({
      where: { email: body.email } as any,
    });
    if (exists)
      throw new BadRequestException('Bu e-posta adresi zaten kullanımda.');

    const hashedPassword = await bcrypt.hash(body.password, 10);
    return this.userRepo.save({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: hashedPassword,
      mustChangePassword: true,
      role: body.role || 'personel',
      unvan: body.unvan,
      toplamIzinHakki: Number(body.toplamIzinHakki || 14),
      iseGirisTarihi: body.iseGirisTarihi,
      normalCalismaSaati: Number(body.normalCalismaSaati || 8),
      saatlikUcret: Number(body.saatlikUcret || 0),
      gunlukUcret: Number(body.gunlukUcret || 0),
      canViewDashboard:
        body.canViewDashboard !== undefined ? body.canViewDashboard : true,
      canManagePersonnel:
        body.canManagePersonnel ||
        ['admin'].includes(body.role || ''),
      canManageFinance:
        body.canManageFinance ||
        ['admin'].includes(body.role || ''),
      canApproveLeaves:
        body.canApproveLeaves ||
        ['admin', 'yonetici'].includes(body.role || ''),
      canManageInventory:
        body.canManageInventory ||
        ['admin'].includes(body.role || ''),
      canViewLogs:
        body.canViewLogs || ['admin'].includes(body.role || ''),
      tcKimlikNo: body.tcKimlikNo,
      telefon: body.telefon,
      dogumTarihi: body.dogumTarihi,
      kanGrubu: body.kanGrubu,
      medeniHal: body.medeniHal,
      cinsiyet: body.cinsiyet,
      acilDurumKisisi: body.acilDurumKisisi,
      acilDurumTelefonu: body.acilDurumTelefonu,
      mezuniyet: body.mezuniyet,
      adres: body.adres,
      sgkNo: body.sgkNo,
      vergiNo: body.vergiNo,
      iban: body.iban,
      ehliyetSinifi: body.ehliyetSinifi,
      askerlikDurumu: body.askerlikDurumu,
      sozlesmeTipi: body.sozlesmeTipi,
      uyruk: body.uyruk,
      departman: body.departmanId
        ? { id: Number(body.departmanId) }
        : undefined,
    });
  }

  @Roles('admin')
  @Put('personel-guncelle/:id')
  async updateUser(
    @Param('id') id: number,
    @Body() body: UpdateUserDto,
    @Request() req: any,
  ) {
    const targetUser = await this.userRepo.findOne({ where: { id: Number(id) } });
    if (!targetUser) throw new NotFoundException('Kullanıcı bulunamadı');

    // Güvenlik kontrolü: Şifre veya Email değişiyorsa mevcut şifre onayı
    if (
      (body.email && body.email !== targetUser.email) ||
      (body.password && body.password.trim() !== '')
    ) {
      if (!body.currentPassword)
        throw new UnauthorizedException(
          'Güvenlik onayı için mevcut şifrenizi girmelisiniz!',
        );
      
      const requester = await this.userRepo.findOne({
        where: { id: req.user.sub },
        select: ['password'] as any,
      });

      if (
        !requester ||
        !(await bcrypt.compare(
          body.currentPassword,
          (requester as any).password,
        ))
      ) {
        throw new UnauthorizedException('Mevcut şifrenizi hatalı girdiniz!');
      }
    }

    const updateData: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      role: body.role,
      unvan: body.unvan,
      iseGirisTarihi: body.iseGirisTarihi,
      normalCalismaSaati: Number(body.normalCalismaSaati || 8),
      saatlikUcret: Number(body.saatlikUcret || 0),
      gunlukUcret: Number(body.gunlukUcret || 0),
      canViewDashboard: body.canViewDashboard,
      canManagePersonnel:
        body.canManagePersonnel ||
        ['admin'].includes(body.role || targetUser.role),
      canManageFinance:
        body.canManageFinance ||
        ['admin'].includes(body.role || targetUser.role),
      canApproveLeaves:
        body.canApproveLeaves ||
        ['admin', 'yonetici'].includes(body.role || targetUser.role),
      canManageInventory:
        body.canManageInventory ||
        ['admin'].includes(body.role || targetUser.role),
      canViewLogs:
        body.canViewLogs || ['admin'].includes(body.role || targetUser.role),
      tcKimlikNo: body.tcKimlikNo,
      telefon: body.telefon,
      dogumTarihi: body.dogumTarihi,
      kanGrubu: body.kanGrubu,
      medeniHal: body.medeniHal,
      cinsiyet: body.cinsiyet,
      acilDurumKisisi: body.acilDurumKisisi,
      acilDurumTelefonu: body.acilDurumTelefonu,
      mezuniyet: body.mezuniyet,
      adres: body.adres,
      sgkNo: body.sgkNo,
      vergiNo: body.vergiNo,
      iban: body.iban,
      ehliyetSinifi: body.ehliyetSinifi,
      askerlikDurumu: body.askerlikDurumu,
      sozlesmeTipi: body.sozlesmeTipi,
      uyruk: body.uyruk,
      istenAyrilisTarihi: body.istenAyrilisTarihi,
    };

    if (body.password && body.password.trim() !== '') {
      updateData.password = await bcrypt.hash(body.password, 10);
    }
    
    if (body.departmanId) {
      updateData.departman = { id: Number(body.departmanId) };
    } else if (body.departmanId === null) {
      updateData.departman = null;
    }

    if (body.mfaEnabled !== undefined) {
      updateData.mfaEnabled = body.mfaEnabled;
    }

    // Deep Audit Logs
    const oldData = JSON.stringify({
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      email: targetUser.email,
      role: targetUser.role,
      mfaEnabled: targetUser.mfaEnabled
    });

    await this.userRepo.update(id, updateData);
    
    const updatedUser = await this.userRepo.findOne({ where: { id: Number(id) } });
    const newData = JSON.stringify({
      firstName: updatedUser?.firstName,
      lastName: updatedUser?.lastName,
      email: updatedUser?.email,
      role: updatedUser?.role,
      mfaEnabled: updatedUser?.mfaEnabled
    });

    await this.logRepo.save({
      islem: `Personel guncellendi: ${targetUser.firstName} ${targetUser.lastName}`,
      yapanKisi: req.user?.name || 'Admin',
      tarih: new Date().toLocaleString('tr-TR'),
      entityName: 'User',
      entityId: String(id),
      oldData,
      newData,
    });

    // Bildirim gonder (Diger adminlere)
    const admins = await this.userRepo.find({
      where: [{ role: 'admin' }] as any,
    });
    for (const a of admins) {
      if (a.id !== req.user?.sub) {
        const savedNotif = await this.notifRepo.save({
          title: 'Personel Guncellemesi',
          message: `${req.user?.name || 'Bir yetkili'}, "${targetUser.firstName} ${targetUser.lastName}" personelinin bilgilerini guncelledi.`,
          date: new Date().toLocaleString('tr-TR'),
          user: { id: a.id } as any,
          isRead: false,
        });
        (this.eventsGateway as any).server
          .to(`user_${a.id}`)
          .emit('new_notification', savedNotif);
      }
    }


    return { success: true };
  }

  @Roles('admin')
  @Post('send-custom-email')
  async sendCustomEmail(@Body() body: { userIds: number[], subject: string, message: string }) {
    if (!body.userIds || !Array.isArray(body.userIds) || body.userIds.length === 0 || !body.subject || !body.message) {
      throw new BadRequestException('Eksik bilgi: userIds (dizi), subject veya message gerekli.');
    }

    const users = await this.userRepo.find({
      where: body.userIds.map(id => ({ id })) as any
    });

    if (users.length === 0) {
      throw new NotFoundException('Hiçbir kullanıcı bulunamadı.');
    }

    const emails = users.map(u => u.email).filter(e => !!e);
    
    if (emails.length === 0) {
      throw new BadRequestException('Seçilen kullanıcıların e-posta adresi bulunmuyor.');
    }

    try {
      await this.mailService.sendCustomMail(emails, body.subject, body.message);
      
      // Logla
      await this.logRepo.save({
        islem: `Toplu/Tekil Mail Gönderildi: ${body.subject}`,
        yapanKisi: 'Admin',
        tarih: new Date().toLocaleString('tr-TR'),
        newData: JSON.stringify({ aliciSayisi: emails.length, konu: body.subject }),
      });

      return { success: true, count: emails.length };
    } catch (err) {
      console.error('Mail Sending Error:', err);
      throw new InternalServerErrorException('E-posta gönderimi sırasında bir hata oluştu: ' + err.message);
    }
  }

  @Roles('admin')
  @Post('scan-weak-passwords')
  async scanWeakPasswords() {
    const users = await this.userRepo.find();
    let flaggedCount = 0;

    for (const user of users) {
      // Eğer zaten işaretli değilse kontrol et
      if (!user.mustChangePassword) {
        const isDefault = await bcrypt.compare('123', user.password);
        if (isDefault) {
          await this.userRepo.update(user.id, { mustChangePassword: true });
          flaggedCount++;
        }
      }
    }

    // Logla
    await this.logRepo.save({
      islem: `Zayıf Şifre Taraması Yapıldı: ${flaggedCount} kullanıcı işaretlendi`,
      yapanKisi: 'Admin',
      tarih: new Date().toLocaleString('tr-TR'),
      newData: JSON.stringify({ taranan: users.length, isaretlenen: flaggedCount }),
    });

    return { success: true, flaggedCount, totalScanned: users.length };
  }

  @Post('update-dashboard-layout/:id')
  async updateDashboardLayout(
    @Param('id') id: number,
    @Body() body: any,
    @Request() req: any,
  ) {
    if (req.user.sub !== Number(id))
      throw new UnauthorizedException('Yetkisiz işlem.');
    await this.userRepo.update(id, { dashboardLayout: body.layout });
    return { success: true };
  }

  @Post('update-home-layout/:id')
  async updateHomeLayout(
    @Param('id') id: number,
    @Body() body: any,
    @Request() req: any,
  ) {
    if (req.user.sub !== Number(id))
      throw new UnauthorizedException('Yetkisiz işlem.');
    await this.userRepo.update(id, { homeLayout: body.layout });
    return { success: true };
  }

  @Post('update-personal-notes/:id')
  async updatePersonalNotes(
    @Param('id') id: number,
    @Body() body: any,
    @Request() req: any,
  ) {
    if (req.user.sub !== Number(id))
      throw new UnauthorizedException('Yetkisiz işlem.');
    await this.userRepo.update(id, { personalNotes: body.notes });
    return { success: true };
  }

  @Roles('admin')
  @Delete(':id')
  async removeUser(@Param('id') id: number, @Request() req: any) {
    const item = await this.userRepo.findOne({ where: { id } });
    if (item)
      await this.recycleRepo.save({
        itemType: 'Personel',
        itemTitle: `${item.firstName} ${item.lastName}`,
        itemData: JSON.stringify(item),
        deletedAt: new Date().toLocaleString('tr-TR'),
        deletedBy: req?.user
          ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
            req.user.email
          : 'Sistem',
      });
    return this.userRepo.delete(id);
  }

  @Get('duyurular') findAllDuyurular() {
    return this.duyuruRepo.find({
      relations: ['okuyanlar'],
      order: { id: 'DESC' } as any,
    });
  }
  @Roles('admin', 'yonetici')
  @Post('duyuru-ekle')
  async createDuyuru(@Body() body: any) {
    return this.duyuruRepo.save({
      ...body,
      baslik: sanitizeSimpleText(body.baslik),
      icerik: sanitizeRichText(body.icerik),
      tarih: new Date().toLocaleString('tr-TR'),
      okuyanlar: [],
    });
  }
  @Post('duyuru-oku/:id')
  async markAsRead(@Param('id') id: number, @Body() body: { userId: number }) {
    const d = await this.duyuruRepo.findOne({
      where: { id },
      relations: ['okuyanlar'],
    });
    const u = await this.userRepo.findOne({ where: { id: body.userId } });
    if (d && u && !d.okuyanlar.some((x) => x.id === u.id)) {
      d.okuyanlar.push(u);
      await this.duyuruRepo.save(d);
    }
    return { success: true };
  }

  @Delete('duyuru-sil/:id') async removeDuyuru(
    @Param('id') id: number,
    @Request() req: any,
  ) {
    const item = await this.duyuruRepo.findOne({ where: { id } });
    if (item)
      await this.recycleRepo.save({
        itemType: 'Duyuru',
        itemTitle: item.baslik,
        itemData: JSON.stringify(item),
        deletedAt: new Date().toLocaleString('tr-TR'),
        deletedBy: req?.user
          ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
            req.user.email
          : 'Sistem',
      });
    return this.duyuruRepo.delete(id);
  }

  @Get('izinler') findAllIzinler(@Request() req: any) {
    const queryOptions: any = {
      relations: ['personel', 'personel.departman'],
    };

    if (req.user.role === 'admin') {
      // Admin tam erişim
    } else if (req.user.role === 'personel') {
      queryOptions.where = { personel: { id: req.user.sub } };
    } else if (req.user.role === 'yonetici' && req.user.departmanId) {
      queryOptions.where = { personel: { departman: { id: req.user.departmanId } } };
    }

    return this.izinRepo.find(queryOptions);
  }
  @Post('izin-al') async createIzin(@Body() body: any) {
    if (!body.personelId)
      throw new BadRequestException('Personel ID gereklidir.');
    const res = await this.izinRepo.save({
      ...body,
      sebep: body.neden,
      izinTuru: body.izinTuru || 'Yıllık İzin',
      devreYil: body.devreYil,
      gunSayisi: Number(body.gunSayisi || 1),
      isBaslamaTarihi: body.isBaslamaTarihi,
      isYeriSicilNo: body.isYeriSicilNo,
      personel: { id: Number(body.personelId) },
    });

    // Yöneticileri ve Adminleri bilgilendir
    const reviewers = await this.userRepo.find({
      where: [{ role: 'admin' }, { role: 'yonetici' }] as any,
    });
    for (const r of reviewers) {
      await this.createNotification(
        r.id,
        '🔔 Yeni İzin Talebi',
        `Bir personel izin talebi oluşturdu. Onay bekliyor.`,
      );
    }
    return res;
  }
  @Put('izin-onay/:id') async updateIzin(
    @Param('id') id: number,
    @Body() body: any,
    @Request() req: any,
  ) {
    const izin = await this.izinRepo.findOne({
      where: { id },
      relations: ['personel', 'personel.departman'],
    });

    if (!izin) throw new NotFoundException('İzin bulunamadı');

    const currentUser = req.user;
    let newStatus = body.durum;

    // Çok Aşamalı Onay Mantığı
    if (body.durum === 'Onaylandı') {
      if (currentUser.role === 'admin') {
        // Üst Yönetici doğrudan onaylar
        newStatus = 'Onaylandı';
      } else if (currentUser.role === 'yonetici') {
        // Birim yöneticisi onayladığında ikinci aşamaya geçer
        newStatus = 'Yönetici Onayladı';
      }
    }

    await this.izinRepo.update(id, { durum: newStatus });

    // 📧 Bildirim Gönder (Email - Personel)
    try {
      if (izin.personel?.email) {
        await this.mailService.sendLeaveStatusUpdate(
          izin.personel.email,
          newStatus,
          izin.baslangicTarihi,
        );
      }
    } catch (e) {
      console.error('İzin bildirim maili gönderilemedi:', e);
    }

    // Bildirimler
    if (newStatus === 'Yönetici Onayladı') {
      // Adminlere haber ver
      const admins = await this.userRepo.find({
        where: [{ role: 'admin' }] as any,
      });
      for (const a of admins) {
        await this.createNotification(
          a.id,
          '🏛️ Üst Onay Bekleniyor',
          `${izin.personel.firstName} için birim yöneticisi onayı verildi. Son onayınız bekleniyor.`,
        );
      }
    }

    await this.createNotification(
      izin.personel.id,
      '🏖️ İzin Durumu',
      `"${izin.izinTuru}" talebiniz ${newStatus} olarak güncellendi.`,
    );

    return { success: true };
  }

  @Get('tasks') findAllTasks(@Request() req: any) {
    const queryOptions: any = {
      relations: ['personel', 'personel.departman'],
      order: { id: 'DESC' } as any,
    };

    if (req.user.role === 'admin') {
      // Admin tam erişim
    } else if (req.user.role === 'personel') {
      queryOptions.where = { personel: { id: req.user.sub } };
    } else if (req.user.role === 'yonetici' && req.user.departmanId) {
      queryOptions.where = { personel: { departman: { id: req.user.departmanId } } };
    }

    return this.taskRepo.find(queryOptions);
  }
  @Post('task-ekle') async createTask(@Body() body: any, @Request() req: any) {
    const task = await this.taskRepo.save({
      ...body,
      baslik: sanitizeSimpleText(body.baslik),
      aciklama: sanitizeSimpleText(body.aciklama),
      personel: { id: body.personelId },
    });

    // 📧 Bildirim Gönder (Email)
    try {
      const assignee = await this.userRepo.findOne({
        where: { id: body.personelId },
      });
      if (assignee?.email && req.user) {
        await this.mailService.sendTaskAssigned(
          assignee.email,
          task.baslik,
          req.user.name,
        );
      }
    } catch (e) {
      console.error('Görev bildirim maili gönderilemedi:', e);
    }
    await this.createNotification(
      body.personelId,
      '📅 Yeni Görev',
      `"${body.baslik}" görevi size atandı.`,
    );
    return task;
  }
  @Put('task-guncelle/:id') async updateTask(
    @Param('id') id: number,
    @Body() body: any,
  ) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['personel'],
    });
    if (!task) throw new NotFoundException('Görev bulunamadı');
    await this.taskRepo.update(id, { durum: body.durum });
    await this.createNotification(
      task.personel.id,
      '🔄 Görev Güncelleme',
      `"${task.baslik}" durumu: ${body.durum}`,
    );
    return { success: true };
  }
  @Delete('task-sil/:id') async removeTask(
    @Param('id') id: number,
    @Request() req: any,
  ) {
    const item = await this.taskRepo.findOne({ where: { id } });
    if (item)
      await this.recycleRepo.save({
        itemType: 'Görev',
        itemTitle: item.baslik,
        itemData: JSON.stringify(item),
        deletedAt: new Date().toLocaleString('tr-TR'),
        deletedBy: req?.user
          ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
            req.user.email
          : 'Sistem',
      });
    return this.taskRepo.delete(id);
  }

  @Get('expenses') findAllExpenses(@Request() req: any) {
    const queryOptions: any = {
      relations: ['personel', 'personel.departman'],
      order: { id: 'DESC' } as any,
    };

    if (req.user.role === 'admin') {
      // Admin tam erişim
    } else if (req.user.role === 'personel') {
      queryOptions.where = { personel: { id: req.user.sub } };
    } else if (req.user.role === 'yonetici' && req.user.departmanId) {
      queryOptions.where = { personel: { departman: { id: req.user.departmanId } } };
    }

    return this.expenseRepo.find(queryOptions);
  }
  @Post('expense-ekle') async createExpense(@Body() body: any) {
    return this.expenseRepo.save({
      ...body,
      baslik: sanitizeSimpleText(body.baslik),
      personel: { id: body.personelId },
    });
  }
  @Put('expense-onay/:id') async updateExpense(
    @Param('id') id: number,
    @Body() body: any,
    @Request() req: any,
  ) {
    const exp = await this.expenseRepo.findOne({
      where: { id },
      relations: ['personel', 'personel.departman'],
    });

    if (!exp) throw new NotFoundException('Harcama bulunamadı');

    const currentUser = req.user;
    let newStatus = body.durum;

    // Çok Aşamalı Onay Mantığı
    if (body.durum === 'Onaylandı') {
      if (currentUser.role === 'admin') {
        // Üst Yönetici doğrudan onaylar
        newStatus = 'Onaylandı';
      } else if (currentUser.role === 'yonetici') {
        // Birim yöneticisi onayladığında ikinci aşamaya geçer
        newStatus = 'Yönetici Onayladı';
      }
    }

    await this.expenseRepo.update(id, { durum: newStatus });

    // Bildirimler
    if (newStatus === 'Yönetici Onayladı') {
      // Adminlere haber ver
      const admins = await this.userRepo.find({
        where: [{ role: 'admin' }] as any,
      });
      for (const a of admins) {
        await this.createNotification(
          a.id,
          '🏛️ Harcama Üst Onayı',
          `${exp.personel.firstName} için birim yöneticisi harcama onayı verdi. Son onay bekleniyor.`,
        );
      }
    }

    await this.createNotification(
      exp.personel.id,
      '💸 Harcama Durumu',
      `"${exp.baslik}" harcama talebiniz ${newStatus} olarak güncellendi.`,
    );

    return { success: true };
  }

  @Delete('expense-sil/:id')
  async removeExpense(@Param('id') id: number, @Request() req: any) {
    const item = await this.expenseRepo.findOne({
      where: { id },
      relations: ['personel'],
    });
    if (item)
      await this.recycleRepo.save({
        itemType: 'Harcama',
        itemTitle: `${item.baslik} (${item.miktar} TL)`,
        itemData: JSON.stringify(item),
        deletedAt: new Date().toLocaleString('tr-TR'),
        deletedBy: req?.user?.name || 'Sistem',
      });
    return this.expenseRepo.delete(id);
  }

  @Get('maaslar') findAllMaaslar(@Request() req: any) {
    const queryOptions: any = {
      relations: ['personel', 'personel.departman'],
    };

    if (req.user.role === 'admin') {
      // Admin tam erişim
    } else if (req.user.role === 'personel') {
      queryOptions.where = { personel: { id: req.user.sub } };
    } else if (req.user.role === 'yonetici' && req.user.departmanId) {
      queryOptions.where = { personel: { departman: { id: req.user.departmanId } } };
    }

    return this.maasRepo.find(queryOptions);
  }
  @Roles('admin')
  @Post('maas-ekle')
  createMaas(@Body() body: any) {
    return this.maasRepo.save({
      ...body,
      personel: { id: Number(body.personelId) },
    });
  }
  @Roles('admin')
  @Put('maas-odendi/:id')
  updateMaas(@Param('id') id: number) {
    return this.maasRepo.update(id, { durum: 'Odendi' });
  }

  @Get('mesailer') findAllMesailer(@Request() req: any) {
    const queryOptions: any = {
      relations: ['personel', 'personel.departman'],
      order: { tarih: 'DESC' } as any,
    };

    if (req.user.role === 'admin') {
      // Admin tam erişim
    } else if (req.user.role === 'personel') {
      queryOptions.where = { personel: { id: req.user.sub } };
    } else if (req.user.role === 'yonetici' && req.user.departmanId) {
      queryOptions.where = { personel: { departman: { id: req.user.departmanId } } };
    }

    return this.mesaiRepo.find(queryOptions);
  }
  @Post('mesai-baslat') startMesai(@Body() body: any) {
    return this.mesaiRepo.save({
      ...body,
      personel: { id: Number(body.personelId) },
    });
  }
  @Put('mesai-bitir/:id') endMesai(@Param('id') id: number, @Body() body: any) {
    return this.mesaiRepo.update(id, body);
  }

  @Get('zimmetler') findAllZimmetler(@Request() req: any) {
    const queryOptions: any = {
      relations: ['personel', 'personel.departman'],
    };

    if (req.user.role === 'admin') {
      // Admin tam erişim
    } else if (req.user.role === 'personel') {
      queryOptions.where = { personel: { id: req.user.sub } };
    } else if (req.user.role === 'yonetici' && req.user.departmanId) {
      queryOptions.where = { personel: { departman: { id: req.user.departmanId } } };
    }

    return this.zimmetRepo.find(queryOptions);
  }
  @Post('zimmet-ekle') createZimmet(@Body() body: any) {
    return this.zimmetRepo.save({
      ...body,
      personel: { id: Number(body.personelId) },
    });
  }
  @Delete('zimmet-teslim-al/:id') async removeZimmet(
    @Param('id') id: number,
    @Request() req: any,
  ) {
    const item = await this.zimmetRepo.findOne({ where: { id } });
    if (item)
      await this.recycleRepo.save({
        itemType: 'Zimmet',
        itemTitle: item.esyaAdi,
        itemData: JSON.stringify(item),
        deletedAt: new Date().toLocaleString('tr-TR'),
        deletedBy: req?.user
          ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
            req.user.email
          : 'Sistem',
      });
    return this.zimmetRepo.delete(id);
  }

  @Get('documents') findAllDocs(@Request() req: any) {
    const queryOptions: any = {
      relations: ['personel', 'personel.departman'],
    };

    if (req.user.role === 'admin') {
      // Admin tam erişim
    } else if (req.user.role === 'personel') {
      queryOptions.where = { personel: { id: req.user.sub } };
    } else if (req.user.role === 'yonetici' && req.user.departmanId) {
      queryOptions.where = { personel: { departman: { id: req.user.departmanId } } };
    }

    return this.docRepo.find(queryOptions);
  }
  @Post('document-ekle') createDoc(@Body() body: any) {
    return this.docRepo.save({
      ...body,
      personel: { id: Number(body.personelId) },
      yuklemeTarihi: new Date().toLocaleString('tr-TR'),
    });
  }
  @Delete('document-sil/:id') async removeDoc(
    @Param('id') id: number,
    @Request() req: any,
  ) {
    const item = await this.docRepo.findOne({ where: { id } });
    if (item)
      await this.recycleRepo.save({
        itemType: 'Belge',
        itemTitle: item.dosyaAdi,
        itemData: JSON.stringify(item),
        deletedAt: new Date().toLocaleString('tr-TR'),
        deletedBy: req?.user
          ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
            req.user.email
          : 'Sistem',
      });
    return this.docRepo.delete(id);
  }

  @Roles('admin')
  @Get('logs')
  findAllLogs() {
    return this.logRepo.find({ order: { id: 'DESC' } as any, take: 100 });
  }

  @Roles('admin')
  @Delete('log-sil/:id')
  removeLog(@Param('id') id: number) {
    return this.logRepo.delete(id);
  }

  @Roles('admin')
  @Post('logs-clear')
  async clearLogs() {
    try {
      await this.logRepo.createQueryBuilder().delete().where('1=1').execute();
      return { success: true };
    } catch (err) {
      console.error('CRITICAL LOG CLEAR ERROR:', err);
      throw new InternalServerErrorException('Veritabanı silme işlemi başarısız oldu.');
    }
  }
  @Get('departmanlar-liste') findAllDeps() {
    return this.depRepo.find({ relations: ['personeller'] });
  } // YENİ: İlişki eklendi
  @Post('departman-ekle') createDep(@Body() body: any) {
    return this.depRepo.save(body);
  }
  @Put('departman-guncelle/:id') updateDep(
    @Param('id') id: number,
    @Body() body: any,
  ) {
    return this.depRepo.update(id, body);
  }
  @Delete('departman-sil/:id') 
  async removeDep(@Param('id') id: number, @Request() req: any) {
    const item = await this.depRepo.findOne({ where: { id } });
    if (item)
      await this.recycleRepo.save({
        itemType: 'Departman',
        itemTitle: item.ad,
        itemData: JSON.stringify(item),
        deletedAt: new Date().toLocaleString('tr-TR'),
        deletedBy: req?.user?.name || 'Sistem',
      });
    return this.depRepo.delete(id);
  }

  @Get('performance')
  async getPerformanceReviews() {
    return this.perfRepo.find({
      relations: ['personel', 'personel.departman'],
      order: { id: 'DESC' } as any,
    });
  }

  @Post('performance/ai-evaluate/:userId')
  async evaluateWithAI(@Param('userId') userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['gorevler', 'mesailer'],
    });
    if (!user) throw new BadRequestException('Personel bulunamadı');

    const totalTasks = user.gorevler?.length || 0;
    const completedTasks =
      user.gorevler?.filter((t: any) => t.durum === 'Tamamlandı').length || 0;
    const taskCompletionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 50;

    const nSaat = user.normalCalismaSaati || 8;
    const totalMesai =
      user.mesailer?.reduce(
        (sum, m) =>
          sum + (m.toplamCalisma > nSaat ? m.toplamCalisma - nSaat : 0),
        0,
      ) || 0;

    let score = Math.min(
      100,
      Math.round(taskCompletionRate + totalMesai * 1.5),
    );
    if (totalTasks === 0 && totalMesai === 0) score = 65;

    let badge = '🌱 Gelişime Açık';
    let aiSummary =
      'Sistem verisi yetersiz veya adaptasyon sürecinde. Görev atamaları ile potansiyeli ölçülmeli.';
    if (score >= 90) {
      badge = '🌟 Şirket Yıldızı';
      aiSummary = `AI Analizi: Mükemmel performans! Takıma liderlik edebilecek inisiyatif ve enerjiye sahip.`;
    } else if (score >= 75) {
      badge = '🚀 Hızlı Çözücü';
      aiSummary = `AI Analizi: İstikrarlı ve verimli. Görevleri zamanında, sorunsuz tamamlıyor.`;
    }

    const review = await this.perfRepo.save({
      score,
      badge,
      aiSummary,
      date: new Date().toLocaleDateString('tr-TR'),
      evaluator: 'Sistem Yapay Zekası',
      personel: user,
    });

    user.performansPuani = score;
    user.performansRozeti = badge;
    user.performansDegerlendirmesi = aiSummary;
    await this.userRepo.save(user);

    await this.createNotification(
      user.id,
      '🤖 AI Performans Raporu',
      'Yapay zeka asistanı sizin için yeni bir rapor oluşturdu.',
    );
    return review;
  }

  @Roles('admin')
  @Get('recycle-bin')
  async getRecycleBin() {
    return this.recycleRepo.find({ order: { id: 'DESC' } as any });
  }

  @Roles('admin')
  @Post('recycle-restore/:id')
  async restoreItem(@Param('id') id: number) {
    try {
      const trashItem = await this.recycleRepo.findOne({ where: { id } });
      if (!trashItem) throw new NotFoundException('Kayıt bulunamadı.');

      const data = JSON.parse(trashItem.itemData);
      delete data.id;

      const cleanData = { ...data };
      if (cleanData.personel && cleanData.personel.id)
        cleanData.personel = { id: cleanData.personel.id };
      if (cleanData.departman && cleanData.departman.id)
        cleanData.departman = { id: cleanData.departman.id };

      [
        'izinler',
        'mesailer',
        'zimmetler',
        'gorevler',
        'harcamalar',
        'belgeler',
        'okuyanlar',
        'tasks',
      ].forEach((k) => delete cleanData[k]);

      if (trashItem.itemType === 'Duyuru')
        await this.duyuruRepo.save(cleanData);
      else if (trashItem.itemType === 'Görev')
        await this.taskRepo.save(cleanData);
      else if (trashItem.itemType === 'Zimmet')
        await this.zimmetRepo.save(cleanData);
      else if (trashItem.itemType === 'Belge')
        await this.docRepo.save(cleanData);
      else if (trashItem.itemType === 'Personel')
        await this.userRepo.save(cleanData);

      await this.recycleRepo.delete(id);
      await this.logRepo.save({
        islem: `${trashItem.itemType} kaydı başarıyla geri yüklendi.`,
        yapanKisi: 'Admin',
        tarih: new Date().toLocaleString('tr-TR'),
      });

      return { success: true };
    } catch (error) {
      console.error('GERİ YÜKLEME HATASI:', error);
      throw new BadRequestException('Geri yükleme sırasında hata oluştu.');
    }
  }

  @Roles('admin')
  @Post('recycle-empty')
  async emptyRecycleBin() {
    try {
      await this.recycleRepo.createQueryBuilder().delete().where('1=1').execute();
      return { success: true };
    } catch (err) {
      console.error('CRITICAL RECYCLE CLEAR ERROR:', err);
      throw new InternalServerErrorException('Çöp kutusu boşaltılamadı.');
    }
  }

  @Roles('admin')
  @Delete('recycle-delete/:id')
  async deleteTrashItem(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId)) throw new BadRequestException('Geçersiz ID');
    await this.recycleRepo.delete(numericId);
    return { success: true };
  }

  @Roles('admin')
  @Post('recycle-bulk-action')
  async bulkTrashAction(@Body() body: { ids: number[]; action: 'restore' | 'delete' }) {
    if (body.action === 'delete') {
      await this.recycleRepo.delete(body.ids);
    } else {
      for (const id of body.ids) {
        // Restore logic is complex, reuse restoreItem logic if possible
        // For now, let's just do individual restores in the loop for simplicity
        await this.restoreItem(id);
      }
    }
    return { success: true };
  }
  @Get('chat')
  async getChat() {
    return this.msgRepo.find({
      relations: ['sender'],
      order: { id: 'ASC' } as any,
      take: 50,
    });
  }

  @Post('chat')
  async sendMsg(@Body() body: { userId: number; content: string }) {
    const user = await this.userRepo.findOne({ where: { id: body.userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    return this.msgRepo.save({
      content: body.content,
      timestamp: new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isAi: false,
      sender: user,
    });
  }

  @Post('ai-copilot')
  async askAi(@Body() body: { prompt: string }) {
    const pCount = await this.userRepo.count();
    const dCount = await this.depRepo.count();
    const izinler = await this.izinRepo.find({ relations: ['personel'] });
    const pendingIzin = izinler.filter((i) => i.durum === 'Beklemede').length;
    const tasks = await this.taskRepo.find({ relations: ['personel'] });
    const pendingTasks = tasks.filter((t) => t.durum === 'Beklemede').length;
    const gecikenGorevler = tasks.filter(
      (t) => t.durum !== 'Tamamlandı' && new Date(t.sonTarih) < new Date(),
    );
    const maaslar = await this.maasRepo.find();
    const exps = await this.expenseRepo.find({
      where: { durum: 'Onaylandı' } as any,
    });
    const totalMaas = maaslar.reduce(
      (sum, m) => sum + Number(m.temelMaas) + Number(m.prim),
      0,
    );
    const totalExp = exps.reduce((sum, e) => sum + Number(e.miktar), 0);

    const prompt = body.prompt.toLowerCase();

    try {
      const apiKey: string = 'BURAYA_KENDI_YENI_API_KEYINI_YAZMALISIN';

      const systemContext = `
        Sen "ERP Core" adlı kurumsal personel yönetim sisteminin süper zeki asistanısın. 
        Kullanıcı sana şirket verileri hakkında sorular soracak. 
        
        Şu anki güncel şirket verileri şunlar:
        - Aktif Personel: ${pCount}
        - Departman: ${dCount}
        - Bekleyen İzin: ${pendingIzin}
        - Bekleyen Görev: ${pendingTasks}
        - Geciken Görev: ${gecikenGorevler.length}
        - Toplam Maaş Gideri: ${totalMaas} TL
        - Onaylanmış Ek Harcama: ${totalExp} TL

        Kurallar: Bu verilere dayanarak yöneticinin sorusuna Markdown formatında profesyonel cevap ver.
        Yöneticinin Sorusu: "${body.prompt}"
      `;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent(systemContext);
      return { response: result.response.text() };
    } catch (error) {
      console.error(
        'GOOGLE API HATASI (Yerel Zekaya Geçiliyor): ',
        error.message,
      );

      let fallbackResponse = `⚡ **ERP Core Çevrimdışı Analiz Modülü Devrede**\n*(Dış API kotası aşıldı veya model hatası alındı, sistem kendi iç zekasıyla yanıt veriyor)*\n\n`;

      if (
        prompt.includes('bütçe') ||
        prompt.includes('para') ||
        prompt.includes('gider') ||
        prompt.includes('maliyet')
      ) {
        fallbackResponse += `Şu anki güncel verilere göre şirketimizin toplam maaş yükü **${totalMaas.toLocaleString()} ₺**, onaylanan ekstra harcamalar ise **${totalExp.toLocaleString()} ₺**'dir.\n\nŞirketin genel bütçe gideri **${(totalMaas + totalExp).toLocaleString()} ₺** olarak hesaplanmıştır.`;
      } else if (
        prompt.includes('risk') ||
        prompt.includes('geciken') ||
        prompt.includes('sorun') ||
        prompt.includes('uyarı')
      ) {
        fallbackResponse += `Sistemde şu an **${gecikenGorevler.length} adet** teslim tarihi geçmiş ve tamamlanmamış görev bulunmaktadır. Ayrıca onayınızı bekleyen ${pendingTasks} adet yeni görev ataması mevcuttur. Lütfen ilgili personellerle iletişime geçin.`;
      } else if (
        prompt.includes('izin') ||
        prompt.includes('kimler yok') ||
        prompt.includes('tatil')
      ) {
        const bugun = new Date();
        const bugunIzinliler = izinler.filter(
          (i) =>
            i.durum === 'Onaylandı' &&
            new Date(i.baslangicTarihi) <= bugun &&
            new Date(i.bitisTarihi) >= bugun,
        );
        if (bugunIzinliler.length > 0) {
          fallbackResponse +=
            `Bugün ofiste olmayan ${bugunIzinliler.length} personelimiz var:\n` +
            bugunIzinliler
              .map((i) => `• ${i.personel?.firstName} ${i.personel?.lastName}`)
              .join('\n');
        } else {
          fallbackResponse += `Bugün herkes ofiste, onaylı izne ayrılmış personel bulunmuyor. Ekip tam kadro çalışıyor.`;
        }
      } else {
        fallbackResponse += `Sistemde aktif olarak ${pCount} personel çalışmaktadır. Bekleyen izin sayısı ${pendingIzin} ve geciken görev sayısı ${gecikenGorevler.length}'dir.\n\n*(Detaylı yerel analiz için lütfen "bütçe", "risk" veya "izin" kelimelerini içeren sorular sorunuz.)*`;
      }

      return { response: fallbackResponse };
    }
  }

  @Get('checklists') findAllCheck() {
    return this.checkRepo.find({ relations: ['personel'] });
  }
  @Post('checklist-ekle') async createCheck(@Body() body: any) {
    return this.checkRepo.save({
      ...body,
      tarih: new Date().toLocaleString('tr-TR'),
      personel: { id: body.personelId },
    });
  }
  @Put('checklist-guncelle/:id') async updateCheck(
    @Param('id') id: number,
    @Body() body: any,
  ) {
    return this.checkRepo.update(id, body);
  }
  @Delete('checklist-sil/:id') 
  async removeCheck(@Param('id') id: number, @Request() req: any) {
    const item = await this.checkRepo.findOne({ where: { id } });
    if (item)
      await this.recycleRepo.save({
        itemType: 'Checklist',
        itemTitle: item.baslik,
        itemData: JSON.stringify(item),
        deletedAt: new Date().toLocaleString('tr-TR'),
        deletedBy: req?.user?.name || 'Sistem',
      });
    return this.checkRepo.delete(id);
  }
}
