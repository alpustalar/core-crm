import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoTransactionManager } from './mongo-transaction.manager';
import { MESSAGING_MONGO_CONNECTION } from './mongo.connection';
import { MongoOutbox, MongoOutboxSchema } from './outbox/mongo-outbox.schema';

/**
 * Mongo tarafının transaction + outbox altyapısı. `PrismaModule` gibi `@Global`
 * sağlanır — `MongoTransactionManager` handler'lara ek modül importu olmadan
 * inject edilir.
 */
@Global()
@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: MongoOutbox.name, schema: MongoOutboxSchema }],
      MESSAGING_MONGO_CONNECTION
    ),
  ],
  providers: [MongoTransactionManager],
  exports: [MongoTransactionManager],
})
export class MongoPersistenceModule {}
