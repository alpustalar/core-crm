import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TelegramChannelStatusSchema, TelegramProviderSchema } from '@shared';

export type ClinicTelegramChannelDocument =
  HydratedDocument<ClinicTelegramChannelModel>;

/**
 * Kliniğin Telegram kanal config'i. Hibrit: provider=BOT_API (BotFather token + webhook)
 * veya MTPROTO (numarayla kullanıcı hesabı, GramJS StringSession). Token/session şifreli.
 */
@Schema({
  collection: 'clinic_telegram_channels',
  timestamps: false,
  versionKey: false,
})
export class ClinicTelegramChannelModel {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ type: String, required: true })
  clinicId!: string;

  @Prop({ type: String, required: true })
  organizationId!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(TelegramProviderSchema.enum),
  })
  provider!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(TelegramChannelStatusSchema.enum),
    default: TelegramChannelStatusSchema.enum.PENDING,
  })
  status!: string;

  @Prop({ type: String, default: null })
  botTokenEnc!: string | null;

  @Prop({ type: String, default: null })
  botUsername!: string | null;

  @Prop({ type: String, default: null })
  webhookSecret!: string | null;

  @Prop({ type: String, default: null })
  phoneNumber!: string | null;

  @Prop({ type: String, default: null })
  mtprotoSessionEnc!: string | null;

  @Prop({ type: String, default: null })
  lastError!: string | null;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date, required: true })
  updatedAt!: Date;

  @Prop({ type: Number, default: 0, select: false })
  lockVersion!: number;
}

export const ClinicTelegramChannelSchema = SchemaFactory.createForClass(
  ClinicTelegramChannelModel
);

// Prisma'daki @@unique([clinicId, provider]) karşılığı — klinik hem BOT_API hem
// MTPROTO kanalı taşıyabilir, ama her providerdan bir tane.
ClinicTelegramChannelSchema.index(
  { clinicId: 1, provider: 1 },
  { unique: true }
);
ClinicTelegramChannelSchema.index({ clinicId: 1 });
