/* eslint-disable no-console */
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';

// Uygulama dışında (CLI) çalıştığı için ConfigModule yok; env dosyası elle yüklenir
// (prisma.config.ts ile aynı yöntem).
config({ path: `envs/.env.${process.env.NODE_ENV ?? 'development'}` });

/**
 * Messaging verisini Postgres'ten MongoDB'ye taşır (tek seferlik cutover).
 *
 * Çalıştırma:
 *   cd apps/api && npx ts-node -r tsconfig-paths/register \
 *     src/infrastructure/persistence/mongo/scripts/migrate-messaging-to-mongo.ts
 *
 * Tasarım notları:
 *
 * 1. **Ham SQL kullanır** (Prisma modelleri değil). Cutover sırasında `messaging.prisma`
 *    silinecek ve generated client'ta bu modeller kalmayacak; ham sorgu script'i o
 *    silmeden sonra da (ör. doğrulama/tekrar çalıştırma için) kullanılabilir kılar.
 * 2. **Idempotenttir**: her doküman `_id` üzerinden upsert edilir. Yarıda kesilirse
 *    baştan çalıştırmak güvenlidir; mükerrer kayıt üretmez.
 * 3. **Sayfalı okur**: `messages` milyonlarca satır olabilir; tümü belleğe alınmaz.
 * 4. **Şema alan adları Prisma modelleriyle birebir aynıdır**; dönüşüm yalnız
 *    `id` → `_id` ve snake_case → camelCase eşlemesidir.
 */

const BATCH_SIZE = 1_000;

const prisma = new PrismaClient();

interface MigrationSpec {
  /** Postgres tablo adı. */
  table: string;
  /** Mongo koleksiyon adı. */
  collection: string;
  /** snake_case kolon → camelCase alan eşlemesi (id hariç). */
  columns: Record<string, string>;
}

const SPECS: MigrationSpec[] = [
  {
    table: 'conversations',
    collection: 'conversations',
    columns: {
      organization_id: 'organizationId',
      clinic_id: 'clinicId',
      assigned_user_id: 'assignedUserId',
      last_message_at: 'lastMessageAt',
      patient_id: 'patientId',
      lead_id: 'leadId',
      last_inbound_at: 'lastInboundAt',
      status: 'status',
      channel: 'channel',
      contact_phone: 'contactPhone',
      contact_name: 'contactName',
      unread_count: 'unreadCount',
      agent_read_at: 'agentReadAt',
      window_expires_at: 'windowExpiresAt',
      marketing_opt_out: 'marketingOptOut',
      opt_out_at: 'optOutAt',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
    },
  },
  {
    table: 'messages',
    collection: 'messages',
    columns: {
      conversation_id: 'conversationId',
      external_id: 'externalId',
      sent_by_user_id: 'sentByUserId',
      reply_to_external_id: 'replyToExternalId',
      direction: 'direction',
      type: 'type',
      body: 'body',
      media_url: 'mediaUrl',
      status: 'status',
      error_reason: 'errorReason',
      error_code: 'errorCode',
      payload: 'payload',
      media_type: 'mediaType',
      pricing_category: 'pricingCategory',
      billable: 'billable',
      template_name: 'templateName',
      template_language: 'templateLanguage',
      template_params: 'templateParams',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
    },
  },
  {
    table: 'clinic_whatsapp_channels',
    collection: 'clinic_whatsapp_channels',
    columns: {
      clinic_id: 'clinicId',
      organization_id: 'organizationId',
      phone_number_id: 'phoneNumberId',
      waba_id: 'wabaId',
      display_phone_number: 'displayPhoneNumber',
      access_token: 'accessToken',
      verify_token: 'verifyToken',
      is_active: 'isActive',
      registration_pin: 'registrationPin',
      registered_at: 'registeredAt',
      token_expires_at: 'tokenExpiresAt',
      quality_rating: 'qualityRating',
      messaging_tier: 'messagingTier',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
    },
  },
  {
    table: 'clinic_telegram_channels',
    collection: 'clinic_telegram_channels',
    columns: {
      clinic_id: 'clinicId',
      organization_id: 'organizationId',
      provider: 'provider',
      status: 'status',
      bot_token_enc: 'botTokenEnc',
      bot_username: 'botUsername',
      webhook_secret: 'webhookSecret',
      phone_number: 'phoneNumber',
      mtproto_session_enc: 'mtprotoSessionEnc',
      last_error: 'lastError',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
    },
  },
  {
    table: 'clinic_instagram_channels',
    collection: 'clinic_instagram_channels',
    columns: {
      clinic_id: 'clinicId',
      organization_id: 'organizationId',
      ig_user_id: 'igUserId',
      page_id: 'pageId',
      username: 'username',
      access_token: 'accessToken',
      is_active: 'isActive',
      token_expires_at: 'tokenExpiresAt',
      last_error: 'lastError',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
    },
  },
  {
    table: 'clinic_ai_agent_configs',
    collection: 'clinic_ai_agent_configs',
    columns: {
      clinic_id: 'clinicId',
      organization_id: 'organizationId',
      is_enabled: 'isEnabled',
      provider: 'provider',
      model: 'model',
      system_prompt: 'systemPrompt',
      api_key: 'apiKey',
      max_tokens: 'maxTokens',
      reply_only_within_window: 'replyOnlyWithinWindow',
      business_hours: 'businessHours',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
    },
  },
];

/** Uygulama ID'leri UUID string'dir; sürücünün varsayılan ObjectId `_id` tipi geçersiz. */
interface StringIdDocument {
  _id: string;
  [field: string]: unknown;
}

const toDocument = (
  row: Record<string, unknown>,
  spec: MigrationSpec
): StringIdDocument => {
  const doc: StringIdDocument = { _id: row.id as string };
  for (const [column, field] of Object.entries(spec.columns)) {
    doc[field] = row[column] ?? null;
  }
  return doc;
};

const migrateTable = async (
  spec: MigrationSpec,
  db: mongoose.mongo.Db
): Promise<number> => {
  const collection = db.collection<StringIdDocument>(spec.collection);

  const [{ count }] = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
    `SELECT COUNT(*)::bigint AS count FROM "${spec.table}"`
  );
  const total = Number(count);
  if (total === 0) {
    console.log(`  ${spec.table}: kayıt yok, atlandı.`);
    return 0;
  }

  let migrated = 0;

  for (let offset = 0; offset < total; offset += BATCH_SIZE) {
    // Sayfalama deterministik olmalı → id'ye göre sıralanır.
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "${spec.table}" ORDER BY id LIMIT ${BATCH_SIZE} OFFSET ${offset}`
    );
    if (rows.length === 0) break;

    // Idempotent: aynı _id tekrar gelirse üzerine yazılır, mükerrer üretilmez.
    await collection.bulkWrite(
      rows.map((row) => ({
        replaceOne: {
          filter: { _id: row.id as string },
          replacement: toDocument(row, spec) as StringIdDocument,
          upsert: true,
        },
      })),
      { ordered: false }
    );

    migrated += rows.length;
    console.log(`  ${spec.table}: ${migrated}/${total}`);
  }

  return migrated;
};

const main = async (): Promise<void> => {
  // Messaging kendi veritabanına taşınır — audit log'un MONGODB_URI'si DEĞİL.
  const mongoUri = process.env.MESSAGING_MONGODB_URI;
  if (!mongoUri) throw new Error('MESSAGING_MONGODB_URI tanımlı değil.');

  console.log('Messaging verisi Postgres → MongoDB taşınıyor...\n');

  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  if (!db) throw new Error('Mongo bağlantısı kurulamadı.');

  const summary: Record<string, number> = {};

  try {
    for (const spec of SPECS) {
      console.log(`▶ ${spec.table} → ${spec.collection}`);
      summary[spec.table] = await migrateTable(spec, db);
    }

    console.log('\nÖzet:');
    for (const [table, migrated] of Object.entries(summary)) {
      console.log(`  ${table}: ${migrated} kayıt`);
    }

    // İndeksler uygulama açılışında Mongoose tarafından da kurulur; burada tekrar
    // çağrılması cutover'dan hemen sonra doğrulama yapılabilmesini sağlar.
    console.log(
      '\nNOT: Benzersizlik indeksleri (conversations, messages.externalId, kanal ' +
        'config clinicId) uygulama ilk açılışta Mongoose tarafından oluşturulur. ' +
        'Taşıma sonrası mükerrer kayıt varsa indeks kurulumu hata verir — bu ' +
        'kasıtlıdır, veri sorununu sessizce geçmez.'
    );
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
};

main().catch((err) => {
  console.error('Taşıma başarısız:', err);
  process.exit(1);
});
