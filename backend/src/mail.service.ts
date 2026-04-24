import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.init();
  }

  private async init() {
    // ⚠ DİKKAT: Burada gerçek SMTP bilgilerini girebilirsiniz.
    // Eğer girilmezse, Ethereal (Test) servisi otomatik devreye girer.
    const smtpConfig = {
      host: process.env.SMTP_HOST || '',
      port: Number(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    };

    if (smtpConfig.user && smtpConfig.pass) {
      this.transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.port === 465,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
      });
    } else {
      // SMTP bilgisi yoksa Ethereal (Test) hesabı oluştur
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(
        '🚀 [MailService] SMTP bilgisi bulunamadı, Ethereal Test hesabı oluşturuldu.',
      );
      console.log(`📧 Test Kullanıcısı: ${testAccount.user}`);
    }
  }

  async sendResetMail(to: string, resetLink: string) {
    if (!this.transporter) await this.init();

    const info = await this.transporter.sendMail({
      from: '"İMPARK PYS" <noreply@impark.com>',
      to,
      subject: 'Şifre Sıfırlama Talebi',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">PYS Şifre Sıfırlama</h2>
          <p>Merhaba,</p>
          <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; rounded: 5px; font-weight: bold;">Şifremi Sıfırla</a>
          </div>
          <p>Eğer bu talebi siz yapmadıysanız lütfen bu e-postayı dikkate almayın.</p>
          <p style="color: #666; font-size: 12px;">Bu link 1 saat boyunca geçerlidir.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
          <p style="font-size: 10px; color: #999;">İMPARK Yönetim Sistemi</p>
        </div>
      `,
    });

    console.log(`✅ [MailService] Şifre sıfırlama maili gönderildi: ${to}`);
    // Ethereal mailleri için önizleme linkini konsola bas
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [MailService] Önizleme Linki: ${previewUrl}`);
      return { success: true, previewUrl };
    }
    return { success: true };
  }

  // 🔐 2FA/MFA Doğrulama Kodu Gönder
  async sendMfaCode(to: string, code: string) {
    if (!this.transporter) await this.init();

    const info = await this.transporter.sendMail({
      from: '"İMPARK Güvenlik" <security@impark.com>',
      to,
      subject: 'PYS Giriş Doğrulama Kodu',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #e1e7ef; border-radius: 12px; background-color: #f8fafc;">
          <h2 style="color: #4f46e5; text-align: center;">Güvenlik Doğrulaması</h2>
          <p style="text-align: center; color: #64748b;">Sisteme giriş yapmak için aşağıdaki 6 haneli kodu kullanın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background: white; padding: 10px 20px; border-radius: 8px; border: 1px solid #cbd5e1;">${code}</span>
          </div>
          <p style="color: #ef4444; font-size: 13px; text-align: center;">Bu kod 5 dakika boyunca geçerlidir.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">Eğer bu girişi siz yapmadıysanız lütfen hemen şifrenizi değiştirin.</p>
        </div>
      `,
    });
    console.log(`✅ [MailService] MFA kodu gönderildi: ${to}`);
    return nodemailer.getTestMessageUrl(info);
  }

  // 📋 Yeni Görev Bildirimi
  async sendTaskAssigned(to: string, taskTitle: string, creator: string) {
    if (!this.transporter) await this.init();

    await this.transporter.sendMail({
      from: '"İMPARK PYS" <notif@impark.com>',
      to,
      subject: 'Yeni Görev Atandı',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 25px; border-radius: 10px; border: 1px solid #eee;">
          <h3 style="color: #4f46e5;">Merhaba, Bir göreviniz var!</h3>
          <p><strong>${creator}</strong> tarafından size yeni bir görev atandı:</p>
          <div style="background: #fdf2f2; padding: 15px; border-left: 4px solid #4f46e5; margin: 15px 0;">
             <p style="margin: 0; font-weight: bold;">${taskTitle}</p>
          </div>
          <p>Detayları görmek için sisteme giriş yapabilirsiniz.</p>
        </div>
      `,
    });
  }

  // 📅 İzin Durumu Güncelleme
  async sendLeaveStatusUpdate(to: string, status: string, startDate: string) {
    if (!this.transporter) await this.init();

    const isApproved = status === 'Onaylandı';

    await this.transporter.sendMail({
      from: '"İMPARK İK" <ik@impark.com>',
      to,
      subject: `İzin Talebiniz ${status}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 25px; border-radius: 10px; border: 1px solid ${isApproved ? '#dcfce7' : '#fee2e2'}; background-color: ${isApproved ? '#f0fdf4' : '#fef2f2'};">
          <h3 style="color: ${isApproved ? '#166534' : '#991b1b'};">${startDate} tarihindeki izin talebiniz hakkında bilgilendirme:</h3>
          <p style="font-size: 18px; font-weight: bold;">Durum: ${status}</p>
          <p>${isApproved ? 'İyi tatiller dileriz!' : 'Detaylar için yöneticinizle görüşebilirsiniz.'}</p>
        </div>
      `,
    });
  }
}
