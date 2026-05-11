import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FINANCE_JOBS, QUEUES } from '@common/constants';
import { Logger } from '@nestjs/common';
import { ILedgerJobData } from '../producers/finance-ledger.producer';
import { CreateLedgerEntryUseCase } from '@modules/finance-ledger/application/use-cases/commands';
import { LedgerCategory, LedgerSource, LedgerType } from '@prisma/client';

@Processor(QUEUES.FINANCE)
export class FinanceLedgerProcessor extends WorkerHost {
  private readonly logger = new Logger(FinanceLedgerProcessor.name);

  constructor(private readonly createLedgerEntry: CreateLedgerEntryUseCase) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case FINANCE_JOBS.PROCESS_LEDGER:
        return this.handleLedgerEntry(job.data);
      case FINANCE_JOBS.GENERATE_INVOICE:
        return;
      default:
        throw new Error(`Tanımlanmamış iş tipi: ${job.name}`);
    }
  }

  private async handleLedgerEntry(data: ILedgerJobData): Promise<void> {
    this.logger.log(`Ledger kaydı işleniyor: paymentId=${data.paymentId}`);

    try {
      await this.createLedgerEntry.execute({
        paymentId: data.paymentId,
        clinicId: data.clinicId,
        patientId: data.patientId,
        type: LedgerType.INCOME,
        source: LedgerSource.IYZICO,
        category: LedgerCategory.TREATMENT_PAYMENT,
        amount: data.amount,
        currency: data.currency,
      });

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
