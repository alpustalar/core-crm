import { Module } from '@nestjs/common';
import {
  ProviderCommandController,
  ProviderQueryController,
} from '@modules/clinical/provider/presentation/http/controllers';

@Module({ controllers: [ProviderQueryController, ProviderCommandController] })
export class ProviderPresentationModule {}
