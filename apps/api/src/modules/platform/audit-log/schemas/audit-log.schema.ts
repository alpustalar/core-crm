import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';

@Schema({
  timestamps: true,
  strict: false,
  collection: 'audit_logs',
})
export class AuditLog extends Document {
  @Prop({ type: String, enum: LogAction, required: true, index: true })
  action: LogAction;

  @Prop({ type: String, enum: LogSource, required: true, index: true })
  source: LogSource;

  @Prop({ type: String, enum: LogType, required: true, index: true })
  type: LogType;

  @Prop({ index: true })
  actorId?: string;

  @Prop({ type: Object })
  details: any;

  @Prop({
    type: Date,
    default: Date.now,
    index: true,
  })
  occurredAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ occurredAt: -1 });
