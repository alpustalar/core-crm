import { Module } from '@nestjs/common';
import { IyzicoModule } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/iyzico.module';

@Module({
  imports: [IyzicoModule],
  providers: [],
})
export class VirtualPosProviderModule {}
