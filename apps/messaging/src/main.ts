import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants/env.constant';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // Meta/WhatsApp webhook imza doğrulaması ham gövde ister.
    rawBody: true,
  });

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = Number(configService.get<number | string>(ENV.PORT, 8081));
  await app.listen(port);
}

void bootstrap();
