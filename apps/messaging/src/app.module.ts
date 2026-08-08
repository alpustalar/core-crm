import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongoPersistenceModule } from '@src/infrastructure/persistence/mongo/mongo-persistence.module';
import { TSCqrsModule } from '@common/cqrs/type-safe-cqrs.module';
import { CryptoModule } from '@src/infrastructure/security/crypto/crypto.module';
import { NatsClientModule } from '@src/transport';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { MessagingAuthModule } from './infrastructure/auth/auth.module';
import { MessagingModule } from './modules/messaging.module';

/**
 * Messaging servisinin kökü.
 *
 * `MongoPersistenceModule` çekirdekten gelir ve `MongoTransactionManager`'ı `@Global`
 * sağlar; o da açılışta Mongo'nun replica set olduğunu doğrular (değilse uygulama
 * ayağa kalkmaz — messaging'in her yazması transaction gerektirir).
 *
 * `MessagingModule` yazışma/kanal/AI bağlamlarının tamamını taşır; `apps/api`'den
 * buraya taşındı ve core'a bakan üç bağımlılığı (AI araçları, kontak çözümleme,
 * `ActorContext`) artık NATS adapter'ları karşılıyor.
 *
 * `messaging` yol öneki `MessagingModule` içinde veriliyor.
 */
@Module({
  imports: [
    InfrastructureModule,
    CqrsModule.forRoot(),
    // Tip-güvenli bus sarmalayıcıları (@Global) — handler'lar ve adapter'lar
    // `TSCommandBus`/`TSQueryBus` inject ediyor.
    TSCqrsModule,
    // Kanal kimlik bilgileri (bot token, access token) şifreli saklanır.
    CryptoModule,
    MongoPersistenceModule,
    NatsClientModule,
    MessagingAuthModule,
    MessagingModule,
  ],
})
export class AppModule {}
