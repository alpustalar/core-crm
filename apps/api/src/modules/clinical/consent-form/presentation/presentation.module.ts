import { Module } from '@nestjs/common';
import { ConsentFormQueryController } from '@modules/clinical/consent-form/presentation/http/controllers/consent-form.query.controller';
import { ConsentFormCommandController } from '@modules/clinical/consent-form/presentation/http/controllers/consent-form.command.controller';

@Module({ controllers: [ConsentFormQueryController, ConsentFormCommandController] })
export class ConsentFormPresentationModule {}
