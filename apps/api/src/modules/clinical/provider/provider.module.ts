import { Module } from '@nestjs/common';
import { ProviderPresentationModule } from '@modules/clinical/provider/presentation/provider-presentation.module';

@Module({ imports: [ProviderPresentationModule] })
export class ProviderModule {}
