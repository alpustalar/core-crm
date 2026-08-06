import { Module } from '@nestjs/common';
import { ConsentFormController } from './controllers/consent-form.controller';
import { ConsentFormApplicationModule } from '@modules/clinical/consent-form/application/application.module';

@Module({
  imports: [ConsentFormApplicationModule],
  controllers: [ConsentFormController],
})
export class ConsentFormPresentationModule {}
