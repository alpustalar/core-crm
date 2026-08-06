import { Module } from '@nestjs/common';
import { ConsentFormQueryModule } from '@modules/clinical/consent-form/application/queries/query.module';
import { ConsentFormCommandModule } from '@modules/clinical/consent-form/application/commands/command.module';

const ApplicationModules = [ConsentFormQueryModule, ConsentFormCommandModule];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class ConsentFormApplicationModule {}
