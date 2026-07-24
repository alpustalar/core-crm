import { Module } from '@nestjs/common';
import { PurchasingPresentationModule } from './presentation/purchasing.presentation.module';
import { PurchasingCommandModule } from './application/commands/command.module';
import { PurchasingQueryModule } from './application/queries/query.module';

@Module({
  imports: [
    PurchasingPresentationModule,
    PurchasingCommandModule,
    PurchasingQueryModule,
  ],
  exports: [PurchasingCommandModule, PurchasingQueryModule],
})
export class PurchasingModule {}
