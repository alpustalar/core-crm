import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClinicInstagramChannelDocument =
  HydratedDocument<ClinicInstagramChannelModel>;

/**
 * Kliniğin Instagram DM kanal config'i (Meta Graph API / Messenger Platform).
 * `igUserId` = Instagram profesyonel hesap id'si; webhook routing ve gönderim hedefi.
 */
@Schema({
  collection: 'clinic_instagram_channels',
  timestamps: false,
  versionKey: false,
})
export class ClinicInstagramChannelModel {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ type: String, required: true })
  clinicId!: string;

  @Prop({ type: String, required: true })
  organizationId!: string;

  @Prop({ type: String, required: true })
  igUserId!: string;

  @Prop({ type: String, default: null })
  pageId!: string | null;

  @Prop({ type: String, default: null })
  username!: string | null;

  @Prop({ type: String, default: null })
  accessToken!: string | null;

  @Prop({ type: Boolean, required: true, default: true })
  isActive!: boolean;

  @Prop({ type: Date, default: null })
  tokenExpiresAt!: Date | null;

  @Prop({ type: String, default: null })
  lastError!: string | null;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date, required: true })
  updatedAt!: Date;

  @Prop({ type: Number, default: 0, select: false })
  lockVersion!: number;
}

export const ClinicInstagramChannelSchema = SchemaFactory.createForClass(
  ClinicInstagramChannelModel
);

ClinicInstagramChannelSchema.index({ clinicId: 1 }, { unique: true });
// Webhook routing: gelen olaydaki IG hesap id'si (entry.id) → kanal.
ClinicInstagramChannelSchema.index({ igUserId: 1 }, { unique: true });
