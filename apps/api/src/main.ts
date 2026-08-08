import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SetupApp } from '@common/setup-app';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ENV } from '@common/constants/env.constant';
import { winstonConfig } from '@src/infrastructure/logging/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
    rawBody: true,
  });

  SetupApp(app);

  const configService = app.get(ConfigService);

  // apps/messaging'in çağırdığı RPC yüzeyi (AI araçları, ActorContext, kontak).
  // HTTP sunucusuyla aynı süreçte dinlenir; ayrı bir process gerekmez.
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [configService.getOrThrow<string>(ENV.NATS_URL)],
      maxReconnectAttempts: -1,
      reconnectTimeWait: 1000,
    },
  });
  // HTTP'den ÖNCE başlatılır: messaging bir isteği, core henüz dinlemiyorken
  // gönderirse zaman aşımına düşerdi.
  await app.startAllMicroservices();

  const port = Number(configService.get<number | string>('PORT', 8080));
  await app.listen(port);
}

bootstrap();
