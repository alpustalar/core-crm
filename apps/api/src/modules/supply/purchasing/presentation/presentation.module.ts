import { Module } from '@nestjs/common';
import { PurchaseRequestQueryController } from '@modules/supply/purchasing/presentation/http/controllers/purchase-request.query.controller';
import { PurchaseRequestCommandController } from '@modules/supply/purchasing/presentation/http/controllers/purchase-request.command.controller';
import { PurchaseOrderQueryController } from '@modules/supply/purchasing/presentation/http/controllers/purchase-order.query.controller';
import { PurchaseOrderCommandController } from '@modules/supply/purchasing/presentation/http/controllers/purchase-order.command.controller';
import { PurchasingCommandModule } from '@modules/supply/purchasing/application/commands/command.module';
import { PurchasingQueryModule } from '@modules/supply/purchasing/application/queries/query.module';

@Module({
  imports: [PurchasingCommandModule, PurchasingQueryModule],
  controllers: [
    PurchaseRequestQueryController,
    PurchaseRequestCommandController,
    PurchaseOrderQueryController,
    PurchaseOrderCommandController,
  ],
})
export class PurchasingPresentationModule {}
