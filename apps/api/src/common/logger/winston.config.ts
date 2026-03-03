import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import 'winston-daily-rotate-file';
import { LogtailTransport } from '@logtail/winston';
import { Logtail } from '@logtail/node';
import { APP_CONFIG } from '../constants';

const isProduction = process.env.NODE_ENV === 'production';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      nestWinstonModuleUtilities.format.nestLike(APP_CONFIG.NAME, {
        colors: true,
        prettyPrint: true,
      }),
    ),
  }),

  new winston.transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  }),
];

if (isProduction && process.env.BETTERSTACK_TOKEN) {
  const logtail = new Logtail(process.env.BETTERSTACK_TOKEN);
  transports.push(new LogtailTransport(logtail));
}

export const winstonConfig = {
  transports: transports,
};
