import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './schemas/audit-log.schema';
import { AuditAction, AuditSource } from './enums/audit-action.enum';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  async log(
    action: AuditAction,
    source: AuditSource,
    details: unknown,
    userId?: string,
  ): Promise<void> {
    try {
      await this.auditLogModel.create({
        action,
        source,
        details,
        userId,
      });
    } catch (error) {
      this.logger.error(
        `Audit Log Failure: ${action} from ${source} could not be saved!`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
