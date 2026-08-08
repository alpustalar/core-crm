import { Module } from '@nestjs/common';
import { ConsentFormController } from '@modules/clinical/consent-form/presentation/http/controllers/consent-form.controller';

@Module({ controllers: [ConsentFormController] })
export class ConsentFormPresentationModule {}
