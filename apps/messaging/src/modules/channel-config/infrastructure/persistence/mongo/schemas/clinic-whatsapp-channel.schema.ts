import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClinicWhatsappChannelDocument =
  HydratedDocument<ClinicWhatsappChannelModel>;

/**
 * Kliniğin WhatsApp Business kanal config'i. Postgres'te `Clinic`'e FK ile bağlıydı;
 * messaging kendi verisine sahip olduğu için `clinicId` artık düz bir string'dir.
 * Klinik silindiğinde temizlik DB cascade'i ile değil, event ile yürür.
 *
 * `accessToken` / `verifyToken` / `registrationPin` şifreli saklanır (TokenCipherService).
 */
@Schema({
  collection: 'clinic_whatsapp_channels',
  timestamps: false,
  versionKey: false,
})
export class ClinicWhatsappChannelModel {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ type: String, required: true })
  clinicId!: string;

  @Prop({ type: String, required: true })
  organizationId!: string;

  @Prop({ type: String, required: true })
  phoneNumberId!: string;

  @Prop({ type: String, default: null })
  wabaId!: string | null;

  @Prop({ type: String, default: null })
  displayPhoneNumber!: string | null;

  @Prop({ type: String, default: null })
  accessToken!: string | null;

  @Prop({ type: String, default: null })
  verifyToken!: string | null;

  @Prop({ type: Boolean, required: true, default: true })
  isActive!: boolean;

  @Prop({ type: String, default: null })
  registrationPin!: string | null;

  @Prop({ type: Date, default: null })
  registeredAt!: Date | null;

  @Prop({ type: Date, default: null })
  tokenExpiresAt!: Date | null;

  @Prop({ type: String, default: null })
  qualityRating!: string | null;

  @Prop({ type: String, default: null })
  messagingTier!: string | null;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date, required: true })
  updatedAt!: Date;

  @Prop({ type: Number, default: 0, select: false })
  lockVersion!: number;
}

export const ClinicWhatsappChannelSchema = SchemaFactory.createForClass(
  ClinicWhatsappChannelModel
);

ClinicWhatsappChannelSchema.index({ clinicId: 1 }, { unique: true });
// Webhook routing: gelen olaydaki phone_number_id → kanal (dolayısıyla klinik).
ClinicWhatsappChannelSchema.index({ phoneNumberId: 1 }, { unique: true });
// Kalite/hesap webhook'ları yalnız display_phone_number taşır.
ClinicWhatsappChannelSchema.index({ displayPhoneNumber: 1 });
