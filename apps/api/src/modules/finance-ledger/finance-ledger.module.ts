import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { FinanceLedgerUseCaseModule } from './application/use-cases/finance-ledger-use-case.module';
import { FinanceLedgerPresentationModule } from './presentation/finance-ledger-presentation.module';
import { FinanceLedgerModuleApi } from './finance-ledger-module.api';
import { FinanceLedgerProducer } from './infrastructure/queue/producers/finance-ledger.producer';
import { FinanceLedgerProcessor } from './infrastructure/queue/processors/finance-ledger.proccessor';
import {
  PaymentCompletedListener,
  PaymentRefundedListener,
} from './infrastructure/events/listeners';

const Listeners = [PaymentCompletedListener, PaymentRefundedListener];

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUES.FINANCE }),
    FinanceLedgerUseCaseModule,
    FinanceLedgerPresentationModule,
  ],
  providers: [
    FinanceLedgerModuleApi,
    FinanceLedgerProducer,
    FinanceLedgerProcessor,
    ...Listeners,
  ],
  exports: [FinanceLedgerModuleApi],
})
export class FinanceLedgerModule {}
