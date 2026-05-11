import { Injectable } from '@nestjs/common';
import { IFinanceLedgerRepository } from '@modules/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { LedgerStatus } from '@prisma/client';

@Injectable()
export class RefundLedgerEntriesUseCase {
  constructor(
    private readonly financeLedgerRepository: IFinanceLedgerRepository
  ) {}

  async execute(paymentId: string): Promise<void> {
    await this.financeLedgerRepository.updateManyStatusByPaymentId(
      paymentId,
      LedgerStatus.REFUNDED
    );
  }
}
