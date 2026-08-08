import path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis/dist/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import Joi from 'joi';
import { ENV } from '@common/constants/env.constant';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';

/**
 * Messaging servisinin altyapısı.
 *
 * `ENV` sabiti çekirdekten gelir ve tüm backend env adlarını taşır (ortak kayıt defteri);
 * ama **zorunluluk app'e özgüdür**. Buradaki Joi şeması yalnız messaging'in gerçekten
 * ihtiyaç duyduklarını ister — Iyzico, HotelBeds, SMTP gibi api'ye ait anahtarlar
 * istenseydi messaging onlarsız açılamazdı ve ayrılmanın anlamı kalmazdı.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(
        process.cwd(),
        'envs',
        `.env.${process.env.NODE_ENV ?? 'development'}`
      ),
      validationSchema: Joi.object({
        [ENV.MODE]: Joi.string()
          .valid('DEVELOPMENT', 'PRODUCTION', 'TEST')
          .default('DEVELOPMENT'),
        [ENV.PORT]: Joi.number().port().default(8081),
        [ENV.ALLOWED_ORIGINS]: Joi.string().required(),

        // Veri ve altyapı — Mongo replica set olmalı (transaction gerekir).
        [ENV.MESSAGING_MONGODB_URI]: Joi.string().required(),
        [ENV.REDIS_URL]: Joi.string().required(),
        [ENV.NATS_URL]: Joi.string().required(),

        // Kanal kimlik bilgileri şifreli saklanır (kernel TokenCipherService).
        [ENV.TOKEN_CIPHER_KEY]: Joi.string().hex().length(64).required(),

        // Kanallar
        [ENV.WHATSAPP_APP_ID]: Joi.string().required(),
        [ENV.WHATSAPP_APP_SECRET]: Joi.string().required(),
        [ENV.WHATSAPP_WEBHOOK_VERIFY_TOKEN]: Joi.string().required(),
        [ENV.INSTAGRAM_APP_ID]: Joi.string().required(),
        [ENV.INSTAGRAM_APP_SECRET]: Joi.string().required(),
        [ENV.INSTAGRAM_WEBHOOK_VERIFY_TOKEN]: Joi.string().required(),
        // Telegram bot webhook'unun kaydedileceği açık HTTPS taban. Zorunlu DEĞİL:
        // yerel geliştirmede açık bir adres yoktur (yer tutucu `none` kullanılır) ve
        // webhook kaydı zaten yapılamaz. Katı istenseydi, yerelde çalışamayacak bir
        // özellik yüzünden servis hiç açılmazdı.
        [ENV.PUBLIC_BASE_URL]: Joi.string().optional(),

        // AI sağlayıcıları — klinik başına seçilir, ikisi de tanımlı olmalı.
        [ENV.ANTHROPIC_API_KEY]: Joi.string().required(),
        [ENV.ANTHROPIC_DEFAULT_MODEL]: Joi.string().required(),
        [ENV.GEMINI_API_KEY]: Joi.string().required(),
        [ENV.GEMINI_DEFAULT_MODEL]: Joi.string().required(),
      }),
    }),

    // Messaging'in kendi veritabanı. Bağlantı adı çekirdekten gelir; repo'lar ve
    // MongoTransactionManager aynı ada bağlı olduğu için burada da aynısı kullanılır.
    MongooseModule.forRootAsync({
      connectionName: MESSAGING_MONGO_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get(ENV.MESSAGING_MONGODB_URI),
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
      }),
    }),

    IoRedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: config.get(ENV.REDIS_URL),
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.get(ENV.REDIS_URL) },
        // api ile aynı Redis'i paylaşır; önek aynı tutulur ki kuyruk adları çakışmasın
        // ve mevcut işler (bull_queue:messaging*) kaybolmasın.
        prefix: 'bull_queue',
      }),
    }),

    EventEmitterModule.forRoot(),
  ],
  exports: [ConfigModule, MongooseModule, BullModule, IoRedisModule],
})
export class InfrastructureModule {}
