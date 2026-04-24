import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BackupService implements OnModuleInit {
  private readonly logger = new Logger(BackupService.name);
  private readonly dbPath = path.join(process.cwd(), 'database.sqlite');
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor() {
    this.ensureBackupDirExists();
  }

  async onModuleInit() {
    this.logger.log('🚀 Backup Service initialized. Taking initial backup...');
    await this.runBackup();
  }

  private ensureBackupDirExists() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      this.logger.log('📂 Backup directory created.');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('🔄 Starting scheduled database backup...');
    await this.runBackup();
    await this.cleanupOldBackups();
  }

  // 🛠️ Manuel tetikleme veya test için metod
  async runBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `db-backup-${timestamp}.sqlite`;
    const backupPath = path.join(this.backupDir, backupFileName);

    try {
      if (!fs.existsSync(this.dbPath)) {
        this.logger.error('❌ Database file not found at: ' + this.dbPath);
        return;
      }

      await fs.promises.copyFile(this.dbPath, backupPath);
      this.logger.log(`✅ Backup successful: ${backupFileName}`);
    } catch (error) {
      this.logger.error(`❌ Backup failed: ${error.message}`);
    }
  }

  private async cleanupOldBackups() {
    this.logger.log('🧹 Cleaning up old backups (Retention: 7 days)...');
    
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = Date.now();
      const retentionMs = 7 * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtimeMs > retentionMs) {
          fs.unlinkSync(filePath);
          this.logger.log(`🗑️ Deleted old backup: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error(`❌ Cleanup failed: ${error.message}`);
    }
  }
}
