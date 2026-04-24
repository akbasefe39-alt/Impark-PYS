import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // Kayıt olma (Şifreyi gizleyerek kaydeder)
  async register(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.userRepo.save({ ...userData, password: hashedPassword });
  }

  // Giriş yapma (Şifreyi kontrol eder ve Token verir)
  async login(email: string, pass: string) {
    const user = await this.userRepo.findOne({ 
      where: { email } as any,
      relations: ['departman'] 
    });

    if (!user) {
      throw new UnauthorizedException(
        'Sistemde bu e-posta adresi ile kayıtlı kullanıcı bulunamadı!',
      );
    }

    const isPasswordMatching = await bcrypt.compare(pass, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException(
        'Girdiğiniz şifre hatalı, lütfen tekrar deneyin!',
      );
    }

    // 🔐 GÜVENLİK: MFA Kontrolü
    if (user.mfaEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 dakika

      await this.userRepo.update(user.id, {
        mfaCode: code,
        mfaCodeExpires: expires,
      });

      const previewUrl = await this.mailService.sendMfaCode(user.email, code);

      // MFA Doğrulaması için geçici, kısa süreli bir token üret
      const tempToken = this.jwtService.sign(
        { sub: user.id, email: user.email, type: 'mfa_pending' },
        { expiresIn: '5m' },
      );

      return {
        mfaRequired: true,
        tempToken,
        previewUrl, // Test kolaylığı için (Ethereal)
      };
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
      departmanId: user.departman?.id,
      canManagePersonnel:
        user.canManagePersonnel || user.role === 'admin',
      canManageFinance:
        user.canManageFinance || user.role === 'admin',
      canApproveLeaves:
        user.canApproveLeaves ||
        ['admin', 'yonetici'].includes(user.role),
      canManageInventory:
        user.canManageInventory || user.role === 'admin',
      canViewLogs:
        user.canViewLogs || user.role === 'admin',
    };
    return { access_token: this.jwtService.sign(payload) };
  }

  // 🔐 MFA Kodunu Doğrula ve Ana Token'ı Ver
  async verifyMfa(tempToken: string, code: string) {
    try {
      const payload = this.jwtService.verify(tempToken);
      if (payload.type !== 'mfa_pending') throw new Error();

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
        relations: ['departman'],
      });
      if (!user || user.mfaCode !== code || new Date() > user.mfaCodeExpires) {
        throw new UnauthorizedException(
          'Geçersiz veya süresi dolmuş doğrulama kodu.',
        );
      }

      // Kodu temizle
      await this.userRepo.update(user.id, {
        mfaCode: null as any,
        mfaCodeExpires: null as any,
      });

      const finalPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`,
        departmanId: user.departman?.id,
        canManagePersonnel:
          user.canManagePersonnel || ['admin', 'superadmin'].includes(user.role),
        canManageFinance:
          user.canManageFinance || ['admin', 'superadmin'].includes(user.role),
        canApproveLeaves:
          user.canApproveLeaves ||
          ['admin', 'yonetici'].includes(user.role),
        canManageInventory:
          user.canManageInventory || user.role === 'admin',
        canViewLogs:
          user.canViewLogs || user.role === 'admin',
      };
      return { access_token: this.jwtService.sign(finalPayload) };
    } catch (err) {
      throw new UnauthorizedException('MFA doğrulaması başarısız oldu.');
    }
  }

  // 📧 Şifre Sıfırlama Talebi
  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } as any });

    // 🛡️ GÜVENLİK: Kullanıcı sızdırmasını önlemek için her durumda aynı mesajı dön
    const genericMessage = {
      message:
        'Sistemde kayıtlıysanız, şifre sıfırlama bağlantısı e-postanıza gönderilmiştir.',
    };

    if (!user) return genericMessage;

    // 1 saat geçerli reset token üret
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'reset' },
      { expiresIn: '1h' },
    );

    // Frontend URL (Geliştirme ortamı için localhost:5173 varsayıyoruz)
    const resetLink = `http://localhost:5173?resetToken=${resetToken}`;

    await this.mailService.sendResetMail(user.email, resetLink);
    return genericMessage;
  }

  // 🔐 Şifreyi Güncelle
  async resetPassword(token: string, newPass: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'reset')
        throw new BadRequestException('Hatalı işlem türü.');

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');

      const hashedPassword = await bcrypt.hash(newPass, 10);
      await this.userRepo.update(user.id, { password: hashedPassword });

      return { success: true };
    } catch (err) {
      throw new BadRequestException(
        'Geçersiz veya süresi dolmuş sıfırlama anahtarı.',
      );
    }
  }
}
