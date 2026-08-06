import { Module } from '@nestjs/common';
import { ConsentFormPresentationModule } from './presentation/presentation.module';
import { ConsentFormApplicationModule } from '@modules/clinical/consent-form/application/application.module';
import { ConsentFormInfrastructureModule } from '@modules/clinical/consent-form/infrastructure/infrastructure.module';

@Module({
  imports: [
    ConsentFormInfrastructureModule,
    ConsentFormPresentationModule,
    ConsentFormApplicationModule,
  ],
})
export class ConsentFormModule {}
