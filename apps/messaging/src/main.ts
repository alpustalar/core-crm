import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ENV } from '@common/constants/env.constant';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // Meta/WhatsApp webhook imza doğrulaması ham gövde ister.
    rawBody: true,
  });

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);

  // Core'un yayınladığı olayları dinler (ör. rezervasyon onayı). Webhook'lar HTTP'den
  // geldiği için her iki taşıma da aynı süreçte açık durur.
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [configService.getOrThrow<string>(ENV.NATS_URL)],
      maxReconnectAttempts: -1,
      reconnectTimeWait: 1000,
    },
  });
  await app.startAllMicroservices();
  const port = Number(configService.get<number | string>(ENV.PORT, 8081));
  await app.listen(port);
}

void bootstrap();
