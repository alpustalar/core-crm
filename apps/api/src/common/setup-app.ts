import helmet from 'helmet';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from '../infrastructure/http/filters/all-exceptions-filter';
import { ZodValidationPipe } from 'nestjs-zod';
import { API_CONFIG } from '@common/constants';

export const SetupApp = (app: INestApplication) => {
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
  app.useGlobalFilters(new AllExceptionsFilter());

  const isProduction = configService.get('NODE_ENV') === 'production';
  if (isProduction) {
    const expressApp = app.getHttpAdapter().getInstance() as {
      set: (key: string, value: any) => void;
    };
    expressApp.set('trust proxy', 1);
  }

  app.useGlobalPipes(new ZodValidationPipe());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  // Shutdown Hooks
  // Prisma Shut down
  app.enableShutdownHooks();
};
