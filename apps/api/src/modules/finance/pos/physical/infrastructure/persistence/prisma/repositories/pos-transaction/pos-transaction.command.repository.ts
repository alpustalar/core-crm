import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPosTransactionCommandRepository } from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
import { PosTransaction } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';
import { PendingTransactionForReconcile } from '@modules/finance/pos/physical/domain/pos-physical.contracts';
import { Prisma, PosProvider, PosTransactionStatus } from '@prisma/client';

@Injectable()
export class PosTransactionCommandRepository
  extends BaseRepository
  implements IPosTransactionCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string) {
    const data = await this.db.posTransaction.findUnique({ where: { id } });
    return data ? new PosTransaction(data) : null;
  }

  async findByIdForUpdate(id: string): Promise<PosTransaction | null> {
    await this.lockRowForUpdate('pos_transactions', id);
    return this.findById(id);
  }

  async findByExternalRefForUpdate(
    externalRef: string
  ): Promise<PosTransaction | null> {
    const existing = await this.db.posTransaction.findFirst({
      where: { externalRef },
      select: { id: true },
    });
    if (!existing) return null;

    return this.findByIdForUpdate(existing.id);
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

  async create(posTransaction: PosTransaction): Promise<PosTransaction> {
    const persistenceData = posTransaction.toPersistence();

    const data = {
      ...persistenceData,
      rawRequest: (persistenceData.rawRequest ??
        Prisma.DbNull) as Prisma.InputJsonValue,
      rawResponse: (persistenceData.rawResponse ??
        Prisma.DbNull) as Prisma.InputJsonValue,
    };
    const raw = await this.db.posTransaction.create({ data });
    posTransaction.flushEvents();
    return new PosTransaction(raw);
  }

  async update(entity: PosTransaction): Promise<PosTransaction> {
    const { id, ...data } = entity.toPersistence();
    const raw = await this.db.posTransaction.update({
      where: { id },
      data: {
        status: data.status,
        externalRef: data.externalRef,
        rawRequest: data.rawRequest ?? undefined,
        rawResponse: data.rawResponse ?? undefined,
        completedAt: data.completedAt,
        updatedAt: data.updatedAt,
      },
    });
    entity.flushEvents();
    return new PosTransaction(raw);
  }
}
