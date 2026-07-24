import { DynamicModule, Module } from '@nestjs/common';
import {
  MAIL_CONFIG_TOKEN,
  mailConfigSchema,
} from '@src/infrastructure/mail/config/mail-config.schema';
import { ConfigService } from '@nestjs/config';
import { APP_CONFIG, ENV } from '@common/constants';
import { MailService } from '@src/infrastructure/mail/mail.service';
import { MAIL_SERVICE } from '@src/infrastructure/mail/interfaces/mail.service.interface';

@Module({})
export class MailModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: MailModule,
      providers: [
        {
          provide: MAIL_CONFIG_TOKEN,
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const result = mailConfigSchema.safeParse({
              EMAIL_ADDRESS: configService.get<string>(ENV.EMAIL_ADDRESS),
              EMAIL_PASSWORD: configService.get<string>(ENV.EMAIL_PASSWORD),
              EMAIL_SMTP_HOST: configService.get<string>(ENV.EMAIL_SMTP_HOST),
              EMAIL_SMTP_PORT: configService.get<string>(ENV.EMAIL_SMTP_PORT),
              APP_NAME: APP_CONFIG.NAME,
            });

            if (!result.success) throw new Error(`[MailModule] Config Error`);
            return result.data;
          },
        },
        {
          provide: MAIL_SERVICE,
          useClass: MailService,
        },
      ],
      exports: [MAIL_CONFIG_TOKEN, MAIL_SERVICE],
    };
  }
}
