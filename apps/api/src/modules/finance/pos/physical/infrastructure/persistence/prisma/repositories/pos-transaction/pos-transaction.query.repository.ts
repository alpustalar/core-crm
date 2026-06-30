import { Injectable } from '@nestjs/common';
import { PosProvider, PosTransactionStatus } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPosTransactionQueryRepository } from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
import { PosTransaction } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';
import { PendingTransactionForReconcile } from '@modules/finance/pos/physical/domain/pos-physical.contracts';

@Injectable()
export class PosTransactionQueryRepository
  extends BaseRepository
  implements IPosTransactionQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<PosTransaction | null> {
    const raw = await this.db.posTransaction.findUnique({ where: { id } });
    return raw ? new PosTransaction(raw) : null;
  }

  async findByExternalRef(externalRef: string): Promise<PosTransaction | null> {
    const raw = await this.db.posTransaction.findFirst({
      where: { externalRef },
    });
    return raw ? new PosTransaction(raw) : null;
  }

  async findByClinicId(clinicId: string): Promise<PosTransaction[]> {
    const rows = await this.db.posTransaction.findMany({
      where: { clinicId },
      orderBy: { initiatedAt: 'desc' },
    });
    return rows.map((r) => new PosTransaction(r));
  }

  async findPendingForReconcile(
    gracePeriodMs: number
  ): Promise<PendingTransactionForReconcile[]> {
    const graceCutoff = new Date(Date.now() - gracePeriodMs);

    // Reconcile yalnızca PAX cihazları içindir (TCP durum sorgusu PAX'a özgüdür);
    // iyzico Terminal işlemleri bu döngüye dahil edilmez.
    const rows = await this.db.posTransaction.findMany({
      where: {
        status: PosTransactionStatus.PENDING,
        initiatedAt: { lt: graceCutoff },
        posDevice: { provider: PosProvider.PAX },
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

    return rows
      .filter(
        (r) =>
          r.posDevice.host !== null &&
          r.posDevice.port !== null &&
          r.posDevice.terminalId !== null &&
          r.posDevice.merchantId !== null
      )
      .map((r) => ({
        id: r.id,
        posDeviceId: r.posDeviceId,
        clinicId: r.clinicId,
        amount: r.amount,
        currency: r.currency,
        initiatedAt: r.initiatedAt,
        device: {
          host: r.posDevice.host as string,
          port: r.posDevice.port as number,
          terminalId: r.posDevice.terminalId as string,
          merchantId: r.posDevice.merchantId as string,
        },
      }));
  }
}
