import { Module } from '@nestjs/common';
import { ProviderController } from '@modules/clinical/provider/presentation/http/controllers';

@Module({ controllers: [ProviderController] })
export class ProviderPresentationModule {}
