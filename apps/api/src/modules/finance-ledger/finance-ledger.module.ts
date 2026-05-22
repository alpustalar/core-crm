import { FinanceLedgerQueryModule } from '@modules/finance-ledger/application/queries/query.module';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { FinanceLedgerPresentationModule } from './presentation/finance-ledger-presentation.module';
import { FinanceLedgerProducer } from './infrastructure/queue/producers/finance-ledger.producer';
import { FinanceLedgerProcessor } from './infrastructure/queue/processors/finance-ledger.proccessor';
import {
  PaymentCompletedListener,
  PaymentRefundedListener,
} from './infrastructure/events/listeners';
import { FinanceLedgerCommandModule } from '@modules/finance-ledger/application/commands/command.module';

const Listeners = [PaymentCompletedListener, PaymentRefundedListener];

@Module({
  imports: [
    FinanceLedgerCommandModule,
    FinanceLedgerQueryModule,
    BullModule.registerQueue({ name: QUEUES.FINANCE }),
    FinanceLedgerPresentationModule,
  ],
  providers: [FinanceLedgerProducer, FinanceLedgerProcessor, ...Listeners],
})
export class FinanceLedgerModule {}
