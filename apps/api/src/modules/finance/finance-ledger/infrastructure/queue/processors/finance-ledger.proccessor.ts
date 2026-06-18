import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FINANCE_JOBS, QUEUES } from '@common/constants';
import { Logger } from '@nestjs/common';
import { ILedgerJobData } from '../producers/finance-ledger.producer';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { CreateLedgerEntyCommand } from '@modules/finance/finance-ledger/application/commands/create-ledger-enty/create-ledger-enty.command';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import {
  LedgerCategorySchema,
  LedgerSourceSchema,
  LedgerTypeSchema,
} from '@shared';

@Processor(QUEUES.FINANCE)
export class FinanceLedgerProcessor extends WorkerHost {
  private readonly logger = new Logger(FinanceLedgerProcessor.name);

  constructor(private readonly commandBus: TSCommandBus) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case FINANCE_JOBS.PROCESS_LEDGER:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return this.handleLedgerEntry(job.data);
      case FINANCE_JOBS.GENERATE_INVOICE:
        return;
      default:
        throw new Error(`Tanımlanmamış iş tipi: ${job.name}`);
    }
  }

  private async handleLedgerEntry(data: ILedgerJobData): Promise<void> {
    this.logger.log(`Ledger kaydı işleniyor: paymentId=${data.paymentId}`);

    const internalCtx = ExecutionContextFactory.createInternal();

    const ledgerEntry = {
      installmentId: data.installmentId,
      paymentId: data.paymentId,
      organizationId: data.organizationId,
      clinicId: data.clinicId,
      patientId: data.patientId,
      type: LedgerTypeSchema.enum.INCOME,
      source: LedgerSourceSchema.enum.PAYMENT_MODULE,
      category: LedgerCategorySchema.enum.TREATMENT_PAYMENT,
      amount: data.amount,
      currency: data.currency,
    };

    try {
      await this.commandBus.execute(
        new CreateLedgerEntyCommand(ledgerEntry, internalCtx)
      );

      this.logger.log(
        `Ledger kaydı başarıyla oluşturuldu: paymentId=${data.paymentId}`
      );
    } catch (error) {
      this.logger.error(
        `Ledger işlenirken hata: paymentId=${data.paymentId}`,
        error
      );
      throw error;
    }
  }
}
