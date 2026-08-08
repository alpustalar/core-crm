import { INestApplication } from '@nestjs/common';
import { setupApp } from '@src/http';
import { AllExceptionsFilter } from '../infrastructure/http/filters/all-exceptions-filter';

/**
 * api'nin açılış ayarı. Ortak kısım çekirdekte (`setupApp`); buradan yalnız
 * api'ye özgü hata filtresi (Prisma dallı) geçilir.
 */
export const SetupApp = (app: INestApplication): void => {
  setupApp(app, { exceptionFilter: new AllExceptionsFilter() });
};
