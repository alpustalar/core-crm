import { Module } from '@nestjs/common';
import { PurchaseRequestController } from '@modules/supply/purchasing/presentation/http/controllers/purchase-request.controller';
import { PurchaseOrderController } from '@modules/supply/purchasing/presentation/http/controllers/purchase-order.controller';
import { PurchasingCommandModule } from '@modules/supply/purchasing/application/commands/command.module';
import { PurchasingQueryModule } from '@modules/supply/purchasing/application/queries/query.module';

@Module({
  imports: [PurchasingCommandModule, PurchasingQueryModule],
  controllers: [PurchaseRequestController, PurchaseOrderController],
})
export class PurchasingPresentationModule {}
