import { Module } from '@nestjs/common';
import { ProviderControllers } from '@modules/provider/presentation/controllers';

@Module({
  controllers: [...ProviderControllers],
  providers: [],
})
export class ProviderModule {}
