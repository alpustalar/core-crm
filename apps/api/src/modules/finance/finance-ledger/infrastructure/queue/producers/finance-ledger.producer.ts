import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { FINANCE_JOBS, QUEUES } from '@common/constants';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface ILedgerJobData {
  installmentId: string;
  paymentId: string;
  appointmentId: string | null;
  organizationId: string;
  clinicId: string;
  patientId: string;
  amount: string;
  currency: CurrencyType;
}

@Injectable()
export class FinanceLedgerProducer {
  constructor(
    @InjectQueue(QUEUES.FINANCE) private readonly ledgerQueue: Queue
  ) {}

  async addToLedgerQueue(data: ILedgerJobData): Promise<void> {
    await this.ledgerQueue.add(FINANCE_JOBS.PROCESS_LEDGER, data, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
    });
  }
}
