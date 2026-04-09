import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SetupApp } from '@common/setup-app';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '@common/logger/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  SetupApp(app);

  const configService = app.get(ConfigService);
  const port = Number(configService.get<number | string>('PORT', 8080));
  await app.listen(port);
}

bootstrap();
