import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ENV } from '@common/constants/env.constant';

/** Servisler arası çağrılarda kullanılan NATS istemcisinin DI token'ı. */
export const NATS_CLIENT = 'NATS_CLIENT';

/**
 * NATS istemcisi — her iki servis de aynı yapılandırmayı kullanır.
 *
 * `@Global`: istemci altyapıdır, her modülün ayrıca import etmesi gerekmez.
 */
@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NATS_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: [config.getOrThrow<string>(ENV.NATS_URL)],
            // Bağlantı koparsa süresiz yeniden dene: karşı servis yeniden başlatıldığında
            // istemcinin kendini toparlaması gerekir, aksi halde tek bir kesinti kalıcı
            // olarak bozardı.
            maxReconnectAttempts: -1,
            reconnectTimeWait: 1000,
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class NatsClientModule {}
