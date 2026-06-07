import { Injectable } from '@nestjs/common';
import { PosTransaction, PosTransactionStatus } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPosTransactionQueryRepository } from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
import { PendingTransactionForReconcile } from '@modules/finance/pos/physical/domain/types/pending-transaction-for-reconcile.type';

@Injectable()
export class PosTransactionQueryRepository
  extends BaseRepository
  implements IPosTransactionQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<PosTransaction | null> {
    return this.db.posTransaction.findUnique({ where: { id } });
  }

  findByExternalRef(externalRef: string): Promise<PosTransaction | null> {
    return this.db.posTransaction.findFirst({ where: { externalRef } });
  }

  findByClinicId(clinicId: string): Promise<PosTransaction[]> {
    return this.db.posTransaction.findMany({
      where: { clinicId },
      orderBy: { initiatedAt: 'desc' },
    });
  }

  async findPendingForReconcile(
    gracePeriodMs: number
  ): Promise<PendingTransactionForReconcile[]> {
    const graceCutoff = new Date(Date.now() - gracePeriodMs);

    const rows = await this.db.posTransaction.findMany({
      where: {
        status: PosTransactionStatus.PENDING,
        initiatedAt: { lt: graceCutoff },
      },
      select: {
        id: true,
        posDeviceId: true,
        clinicId: true,
        amount: true,
        currency: true,
        initiatedAt: true,
        posDevice: {
          select: {
            host: true,
            port: true,
            terminalId: true,
            merchantId: true,
          },
        },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      posDeviceId: r.posDeviceId,
      clinicId: r.clinicId,
      amount: r.amount,
      currency: r.currency,
      initiatedAt: r.initiatedAt,
      device: r.posDevice,
    }));
  }
}
