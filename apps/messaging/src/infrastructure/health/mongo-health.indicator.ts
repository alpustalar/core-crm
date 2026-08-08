import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';
import { HealthIndicator } from '@src/http';

/** Mongoose `readyState`: 1 = connected. */
const CONNECTED = 1;

/**
 * Messaging'in kendi Mongo veritabanı. Servisin tüm yazması buradan geçtiği
 * için erişilemezse servis hazır değildir.
 *
 * `readyState` yetmez, bir de `ping` atılır: sürücü bağlantıyı "connected"
 * gösterirken replica set primary'siz kalmış olabilir ve o durumda transaction
 * açılamaz — messaging'in her yazması transaction gerektirdiğinden bu, hazır
 * olmamak demektir.
 */
@Injectable()
export class MongoHealthIndicator implements HealthIndicator {
  readonly name = 'mongo';

  constructor(
    @InjectConnection(MESSAGING_MONGO_CONNECTION)
    private readonly connection: Connection
  ) {}

  async isHealthy(): Promise<boolean> {
    if (this.connection.readyState !== CONNECTED) return false;

    const result = await this.connection.db?.admin().ping();
    return Boolean(result?.ok);
  }
}
