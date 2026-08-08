import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  MessageDirectionSchema,
  MessageStatusSchema,
  MessageTypeSchema,
} from '@shared';

export type MessageDocument = HydratedDocument<MessageModel>;

/**
 * Yazışma içindeki tek mesaj. Alan adları Prisma modeliyle birebir aynıdır.
 *
 * Mesajlar ayrı bir koleksiyondur (Conversation'a gömülmez): tek yazışma binlerce mesaj
 * taşıyabilir ve gömülü dizi 16 MB doküman sınırına dayanır; ayrıca her gelen mesaj tüm
 * diziyi yeniden yazdırırdı.
 */
@Schema({ collection: 'messages', timestamps: false, versionKey: false })
export class MessageModel {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ type: String, required: true })
  conversationId!: string;

  /** Kanalın mesaj kimliği (WhatsApp wamid). Giden mesajlarda atanana dek null. */
  @Prop({ type: String, default: null })
  externalId!: string | null;

  @Prop({ type: String, default: null })
  sentByUserId!: string | null;

  @Prop({ type: String, default: null })
  replyToExternalId!: string | null;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(MessageDirectionSchema.enum),
  })
  direction!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(MessageTypeSchema.enum),
    default: MessageTypeSchema.enum.TEXT,
  })
  type!: string;

  @Prop({ type: String, default: null })
  body!: string | null;

  @Prop({ type: String, default: null })
  mediaUrl!: string | null;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(MessageStatusSchema.enum),
  })
  status!: string;

  @Prop({ type: String, default: null })
  errorReason!: string | null;

  @Prop({ type: String, default: null })
  errorCode!: string | null;

  /** Zengin gelen tiplerin (interactive/location/contacts/reaction) yapısal gövdesi. */
  @Prop({ type: Object, default: null })
  payload!: unknown;

  @Prop({ type: String, default: null })
  mediaType!: string | null;

  @Prop({ type: String, default: null })
  pricingCategory!: string | null;

  @Prop({ type: Boolean, default: null })
  billable!: boolean | null;

  @Prop({ type: String, default: null })
  templateName!: string | null;

  @Prop({ type: String, default: null })
  templateLanguage!: string | null;

  @Prop({ type: Object, default: null })
  templateParams!: unknown;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date, required: true })
  updatedAt!: Date;

  @Prop({ type: Number, default: 0, select: false })
  lockVersion!: number;
}

export const MessageSchema = SchemaFactory.createForClass(MessageModel);

// Yazışma mesaj listesi (kronolojik sayfalama).
MessageSchema.index({ conversationId: 1, createdAt: -1 });

/**
 * Prisma'daki @@unique([externalId]) karşılığı — mükerrer webhook teslimine karşı
 * DB-seviyesi son güvence (Faz 0'daki Redis dedup kilidi yalnız yarış penceresini kapatır).
 *
 * `partialFilterExpression` şart: giden mesajlar externalId atanana dek null taşır ve
 * Mongo'nun normal unique indeksi **birden çok null'ı reddeder** (Postgres'ten farklı
 * olarak). Kısmi indeks yalnız string değerleri kapsar → çoklu null serbest kalır.
 */
MessageSchema.index(
  { externalId: 1 },
  {
    unique: true,
    partialFilterExpression: { externalId: { $type: 'string' } },
  }
);

// Faturalanabilir mesaj sayımı (klinik maliyet raporu) — konuşma kategorisine göre.
MessageSchema.index({ createdAt: 1, billable: 1 });
