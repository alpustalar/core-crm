import helmet from 'helmet';
import {
  ExceptionFilter,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';
import { API_CONFIG } from '@common/constants/api-config.constant';

export interface SetupAppOptions {
  /**
   * Servisin hata filtresi. Çekirdek `BaseExceptionFilter`'ı doğrudan verilebilir;
   * api kendi Prisma dalını ekleyen alt sınıfını verir.
   */
  exceptionFilter: ExceptionFilter;
}

/**
 * Tüm HTTP servislerinin ortak açılış ayarı: sürümleme, güvenlik başlıkları,
 * CORS, hata filtresi ve doğrulama pipe'ları.
 *
 * Bu fonksiyon çekirdekte duruyor çünkü kopyası çıkarsa iki servis sessizce
 * ayrışır — nitekim ayrımdan sonra messaging bir süre sürümleme öneki ve
 * doğrulama pipe'ı olmadan çalıştı.
 */
export const setupApp = (
  app: INestApplication,
  options: SetupAppOptions
): void => {
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_CONFIG.CURRENT_VERSION,
    prefix: `${API_CONFIG.PREFIX}/${API_CONFIG.VERSION_PREFIX}`,
  });

  app.use(helmet());

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService
      .get<string>('ALLOWED_ORIGINS', 'http://localhost:3000')
      .split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalFilters(options.exceptionFilter);

  // Ters vekil (reverse proxy) arkasında çalışırken istemci IP'si ve protokol
  // X-Forwarded-* başlıklarından okunur; bu olmadan rate-limit ve loglar
  // vekilin IP'sini görür.
  const isProduction = configService.get('NODE_ENV') === 'production';
  if (isProduction) {
    const expressApp = app.getHttpAdapter().getInstance() as {
      set: (key: string, value: unknown) => void;
    };
    expressApp.set('trust proxy', 1);
  }

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableShutdownHooks();
};
