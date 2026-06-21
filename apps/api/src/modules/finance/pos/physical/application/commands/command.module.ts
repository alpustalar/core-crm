import { Module } from '@nestjs/common';
import { RegisterPosDeviceHandler } from './register-pos-device/register-pos-device.handler';
import { InitiatePosTransactionHandler } from './initiate-pos-transaction/initiate-pos-transaction.handler';
import { HandlePosCallbackHandler } from './handle-pos-callback/handle-pos-callback.handler';
import { ReconcilePosTransactionsHandler } from './reconcile-pos-transactions/reconcile-pos-transactions.handler';
import { PaxSaleHandler } from './pax-sale/pax-sale.handler';
import { PaxVoidHandler } from './pax-void/pax-void.handler';
import { PaxRefundHandler } from './pax-refund/pax-refund.handler';
import { PaxBatchCloseHandler } from './pax-batch-close/pax-batch-close.handler';
import { PosDeviceRepositoryModule } from '@modules/finance/pos/physical/infrastructure/persistence/prisma/repositories/pos-device/pos-device.repository.module';
import { PosTransactionRepositoryModule } from '@modules/finance/pos/physical/infrastructure/persistence/prisma/repositories/pos-transaction/pos-transaction.repository.module';
import { PaxModule } from '@src/infrastructure/payment/pos/physical/providers/pax/pax.module';
import { PaymentModule } from '@modules/finance/payment/payment.module';
import { PosPaymentSyncService } from '@modules/finance/pos/physical/application/services/pos-payment-sync.service';
import { PosInfrastructureModule } from '@src/infrastructure/payment/pos/pos.infrastructure.module';

export const POS_COMMAND_HANDLERS = [
  RegisterPosDeviceHandler,
  InitiatePosTransactionHandler,
  HandlePosCallbackHandler,
  ReconcilePosTransactionsHandler,
  PaxSaleHandler,
  PaxVoidHandler,
  PaxRefundHandler,
  PaxBatchCloseHandler,
];

@Module({
  imports: [
    PosDeviceRepositoryModule,
    PosTransactionRepositoryModule,
    PaxModule,
    PaymentModule,
    PosInfrastructureModule,
  ],
  providers: [...POS_COMMAND_HANDLERS, PosPaymentSyncService],
  exports: POS_COMMAND_HANDLERS,
})
export class PhysicalPosCommandModule {}
