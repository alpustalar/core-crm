import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ConversationStatusSchema, MessageChannelSchema } from '@shared';

export type ConversationDocument = HydratedDocument<ConversationModel>;

/**
 * Yazışma başlığı (thread). Alan adları Prisma modeliyle **birebir aynıdır** — entity
 * constructor'ı ve `toPersistence()` çıktısı dokümanla 1:1 eşleşsin diye. `_id` doğrudan
 * uygulama tarafından üretilen UUID'dir (proje ID'leri elle üretir, ObjectId kullanılmaz).
 *
 * `clinicId`/`organizationId`/`patientId`/`leadId` düz string'dir: bounded-context sınırı
 * gereği başka bir modülün koleksiyonuna referans kurulmaz.
 */
@Schema({ collection: 'conversations', timestamps: false, versionKey: false })
export class ConversationModel {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ type: String, required: true })
  organizationId!: string;

  @Prop({ type: String, required: true })
  clinicId!: string;

  @Prop({ type: String, default: null })
  assignedUserId!: string | null;

  @Prop({ type: Date, default: null })
  lastMessageAt!: Date | null;

  @Prop({ type: String, default: null })
  patientId!: string | null;

  @Prop({ type: String, default: null })
  leadId!: string | null;

  /** 24s servis penceresi için son gelen mesaj zamanı. */
  @Prop({ type: Date, default: null })
  lastInboundAt!: Date | null;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ConversationStatusSchema.enum),
    default: ConversationStatusSchema.enum.OPEN,
  })
  status!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(MessageChannelSchema.enum),
    default: MessageChannelSchema.enum.WHATSAPP,
  })
  channel!: string;

  @Prop({ type: String, required: true })
  contactPhone!: string;

  @Prop({ type: String, default: null })
  contactName!: string | null;

  /** Ajanın görmediği mesaj sayacı. */
  @Prop({ type: Number, required: true, default: 0 })
  unreadCount!: number;

  @Prop({ type: Date, default: null })
  agentReadAt!: Date | null;

  @Prop({ type: Date, default: null })
  windowExpiresAt!: Date | null;

  @Prop({ type: Boolean, required: true, default: false })
  marketingOptOut!: boolean;

  @Prop({ type: Date, default: null })
  optOutAt!: Date | null;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date, required: true })
  updatedAt!: Date;

  /**
   * Pessimistic kilit sayacı — `lockDocument()` her "for update" okumasında artırır.
   * Domain'e sızmaz (`select: false` + plain map'te elenir).
   */
  @Prop({ type: Number, default: 0, select: false })
  lockVersion!: number;
}

export const ConversationSchema =
  SchemaFactory.createForClass(ConversationModel);

// Prisma'daki @@unique([clinicId, channel, contactPhone]) karşılığı — aynı kontakla
// ikinci yazışma açılmasını DB seviyesinde engeller (eşzamanlı inbound'un son güvencesi).
ConversationSchema.index(
  { clinicId: 1, channel: 1, contactPhone: 1 },
  { unique: true }
);

// Prisma'daki @@index([clinicId, status]) karşılığı — inbox listeleme.
ConversationSchema.index({ clinicId: 1, status: 1 });

// Inbox varsayılan sıralaması (son mesaja göre).
ConversationSchema.index({ clinicId: 1, lastMessageAt: -1 });
