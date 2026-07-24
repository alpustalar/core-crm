import { Module } from '@nestjs/common';
import { ConsentFormPresentationModule } from './presentation/consent-form.presentation.module';
import { ConsentFormCommandModule } from './application/commands/command.module';
import { ConsentFormQueryModule } from './application/queries/query.module';

@Module({
  imports: [
    ConsentFormPresentationModule,
    ConsentFormCommandModule,
    ConsentFormQueryModule,
  ],
  exports: [ConsentFormCommandModule, ConsentFormQueryModule],
})
export class ConsentFormModule {}
