import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const publicRoutes = [
      '/users/login',
      '/users/forgot-password',
      '/users/reset-password',
      '/users/verify-mfa',
      '/',
    ];

    if (publicRoutes.some(route => request.path.endsWith(route))) {
      return true;
    }


    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Erişim reddedildi: Token bulunamadı.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Erişim reddedildi: Hatalı Token.');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }); // ConfigService üzerinden güvenli anahtar
      request.user = payload; // Rota içerisinden request.user erişimine izin ver
    } catch (e) {
      throw new UnauthorizedException(
        'Erişim reddedildi: Token geçerli değil veya süresi dolmuş.',
      );
    }

    return true;
  }
}
