import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MongoOutboxDocument = HydratedDocument<MongoOutbox>;

/**
 * Mongo tarafındaki outbox — Postgres `Outbox` tablosunun birebir karşılığı. Ayrı
 * olmasının sebebi atomikliktir: event, domain yazmasıyla **aynı Mongo session'ında**
 * mühürlenmeli. Postgres'teki tabloya yazmak iki ayrı veritabanına yazmak demek olurdu
 * ve tam da outbox pattern'in engellemek için var olduğu senaryoyu (yazma başarılı,
 * event kayıp) geri getirirdi.
 */
@Schema({ collection: 'messaging_outbox', timestamps: false })
export class MongoOutbox {
  @Prop({ type: String, required: true })
  _id!: string;

  /** Olayın adı (ör. "messaging.message.received"). */
  @Prop({ type: String, required: true, index: true })
  type!: string;

  @Prop({ type: Object, required: true })
  payload!: Record<string, unknown>;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  /** Null ise henüz yayınlanmadı (relay bu alana bakar). */
  @Prop({ type: Date, default: null })
  processedAt!: Date | null;

  /**
   * Kaç kez yayınlanmaya çalışıldı. Sürekli hata veren bir kayıt (poison pill)
   * relay'i sonsuz döngüye sokmasın diye üst sınıra ulaşınca artık alınmaz;
   * `processedAt: null` + `attempts: MAX` olarak görünür kalır ve loglanır.
   */
  @Prop({ type: Number, default: 0 })
  attempts!: number;
}

export const MongoOutboxSchema = SchemaFactory.createForClass(MongoOutbox);

// Relay taraması: yalnız işlenmemiş kayıtlar, eklenme sırasıyla.
MongoOutboxSchema.index({ processedAt: 1, createdAt: 1 });
