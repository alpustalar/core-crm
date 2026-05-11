import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './schemas/audit-log.schema';
import { LogSource, LogType } from '@src/domain/constants/log-action.constant';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export type AuditLogOptions = Omit<IAuditLog, 'type'>;

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLog>
  ) {}

  /**
   * Ana Kayıt Metodu
   * Tüm yardımcı metotlar burayı besler.
   */
  async record(payload: IAuditLog): Promise<void> {
    try {
      await this.auditLogModel.create({
        action: payload.action,
        source: payload.source ?? LogSource.SYSTEM,
        details: payload.details,
        actorId: payload.actorId,
        type: payload.type,
      });
    } catch (error) {
      this.logger.error(
        `Audit Log Failure: ${payload.action} could not be saved!`,
        error instanceof Error ? error.stack : error
      );
    }
  }

  // --- Yardımcı Kısayollar ---

  async info({
    action,
    details,
    actorId,
    source,
    metadata,
  }: AuditLogOptions): Promise<void> {
    return this.record({
      action,
      details,
      actorId,
      type: LogType.INFO,
      source,
      metadata,
    });
  }

  async warn({
    action,
    details,
    actorId,
    source,
    metadata,
  }: AuditLogOptions): Promise<void> {
    return this.record({
      action,
      details,
      actorId,
      type: LogType.WARNING,
      source,
      metadata,
    });
  }

  async error({
    action,
    details,
    actorId,
    source,
    metadata,
  }: AuditLogOptions): Promise<void> {
    return this.record({
      action,
      details,
      actorId,
      type: LogType.ERROR,
      source,
      metadata,
    });
  }

  async critical({
    action,
    details,
    actorId,
    source,
    metadata,
  }: AuditLogOptions): Promise<void> {
    return this.record({
      action,
      details,
      actorId,
      type: LogType.CRITICAL,
      source,
      metadata,
    });
  }

  async security({
    action,
    details,
    actorId,
    source,
    metadata,
  }: AuditLogOptions): Promise<void> {
    return this.record({
      action,
      details,
      actorId,
      type: LogType.SECURITY,
      source,
      metadata,
    });
  }
}
