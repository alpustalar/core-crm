import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongoPersistenceModule } from '@src/infrastructure/persistence/mongo/mongo-persistence.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

/**
 * Messaging servisinin kökü.
 *
 * `MongoPersistenceModule` çekirdekten gelir ve `MongoTransactionManager`'ı `@Global`
 * sağlar; o da açılışta Mongo'nun replica set olduğunu doğrular (değilse uygulama
 * ayağa kalkmaz — messaging'in her yazması transaction gerektirir).
 *
 * Yazışma/kanal/AI modülleri Faz 3.5'te buraya taşınır; şu an iskelet, altyapının
 * (config + Mongo + Redis + BullMQ + çekirdek alias'ları) ayakta olduğunu doğrular.
 */
@Module({
  imports: [InfrastructureModule, CqrsModule.forRoot(), MongoPersistenceModule],
})
export class AppModule {}
