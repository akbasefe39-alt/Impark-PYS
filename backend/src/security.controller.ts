import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { SecurityService, SecurityScanResult } from './security.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SecurityController {
  private lastReport: SecurityScanResult | null = null;

  constructor(private readonly securityService: SecurityService) {}

  @Post('scan')
  @Roles('admin', 'superadmin')
  async runScan() {
    this.lastReport = await this.securityService.performFullScan();
    return {
      message: 'Security scan completed successfully.',
      report: this.lastReport
    };
  }

  @Get('report')
  @Roles('admin', 'superadmin')
  getLatestReport() {
    return this.lastReport || { message: 'No scan performed yet.' };
  }
}
