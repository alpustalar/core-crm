import { Module } from '@nestjs/common';
import { ConsentFormController } from './controllers/consent-form.controller';
import { ConsentFormCommandModule } from '@modules/clinical/consent-form/application/commands/command.module';
import { ConsentFormQueryModule } from '@modules/clinical/consent-form/application/queries/query.module';

@Module({
  imports: [ConsentFormCommandModule, ConsentFormQueryModule],
  controllers: [ConsentFormController],
})
export class ConsentFormPresentationModule {}
