import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AuditAction, AuditSource } from '../enums/audit-action.enum';

@Schema({ timestamps: true, strict: false })
export class AuditLog extends Document {
  @Prop({ type: String, enum: AuditAction, required: true })
  action: AuditAction;

  @Prop({ type: String, enum: AuditSource, required: true })
  source: AuditSource;

  @Prop()
  userId?: string;

  @Prop({ type: Object })
  details: any;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
