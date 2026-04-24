import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Duyuru } from './duyuru.entity';
import { Task } from './task.entity';
import { User } from './user.entity';
import { ActivityLog } from './log.entity';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface SecurityScanResult {
  timestamp: string;
  score: number; // 0-100
  vulnerabilities: {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: string;
    description: string;
    recommendation: string;
  }[];
  summary: {
    dependencies: string;
    xss: string;
    config: string;
  };
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @InjectRepository(Duyuru) private duyuruRepo: Repository<Duyuru>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(ActivityLog) private logRepo: Repository<ActivityLog>,
  ) {}

  async performFullScan(): Promise<SecurityScanResult> {
    this.logger.log('🕵️ Starting full security audit...');
    
    const results: SecurityScanResult = {
      timestamp: new Date().toISOString(),
      score: 100,
      vulnerabilities: [],
      summary: { dependencies: 'OK', xss: 'OK', config: 'OK' }
    };

    // 1. Dependency Check (npm audit)
    try {
      const { stdout } = await execAsync('npm audit --json', { cwd: process.cwd() });
      const auditData = JSON.parse(stdout);
      if (auditData.metadata.vulnerabilities.total > 0) {
        results.score -= 10;
        results.summary.dependencies = 'ISSUES FOUND';
        results.vulnerabilities.push({
          severity: 'MEDIUM',
          type: 'DEPENDENCY',
          description: `Found ${auditData.metadata.vulnerabilities.total} known vulnerabilities in packages.`,
          recommendation: 'Run "npm audit fix" to resolve automatic issues.'
        });
      }
    } catch (e) {
        // npm audit returns exit code 1 if vulnerabilities found, handled here
        this.logger.warn('Dependency scan noted some issues or failed.');
    }

    // 2. XSS Database Scanner
    const xssPatterns = [/<script/i, /javascript:/i, /onerror=/i, /onload=/i, /eval\(/i];
    
    const duyurular = await this.duyuruRepo.find();
    const xssDuyurular = duyurular.filter(d => xssPatterns.some(p => p.test(d.icerik)));
    
    if (xssDuyurular.length > 0) {
      results.score -= 30;
      results.summary.xss = 'CRITICAL';
      results.vulnerabilities.push({
        severity: 'CRITICAL',
        type: 'XSS',
        description: `Found XSS injection patterns in ${xssDuyurular.length} announcements.`,
        recommendation: 'Sanitize existing database records and ensure validation pipes are strictly enforced.'
      });
    }

    // 3. Environment Auditor
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('JWT_SECRET=defaultSecret') || envContent.includes('JWT_SECRET=super-secret')) {
        results.score -= 20;
        results.summary.config = 'WEAK';
        results.vulnerabilities.push({
          severity: 'HIGH',
          type: 'CONFIG',
          description: 'JWT Secret is set to a weak or default value.',
          recommendation: 'Change JWT_SECRET in .env to a long, random string.'
        });
      }
    }

    // 4. SQL Injection Pattern Search in Logs
    const sqliPatterns = [/' OR 1=1/i, /UNION SELECT/i, /DROP TABLE/i, /--/];
    const logs = await this.logRepo.find({ take: 1000, order: { id: 'DESC' } });
    const suspiciousLogs = logs.filter(l => sqliPatterns.some(p => p.test(l.payload || '')));

    if (suspiciousLogs.length > 0) {
        results.vulnerabilities.push({
            severity: 'HIGH',
            type: 'SQLI_ATTEMPT',
            description: `Detected ${suspiciousLogs.length} suspicious SQLi patterns in recent activity logs.`,
            recommendation: 'Investigate the involved IP addresses and ensure all queries use TypeORM Parameterized queries.'
        });
    }

    // Cap score at 0
    results.score = Math.max(0, results.score);
    
    this.logger.log(`Audit complete. Security Score: ${results.score}/100`);
    return results;
  }
}
