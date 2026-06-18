import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPosTransactionCommandRepository } from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
import { CreatePosTransactionData } from '@modules/finance/pos/physical/domain/types/create-pos-transaction.data';
import { PosTransaction } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';

@Injectable()
export class PosTransactionCommandRepository
  extends BaseRepository
  implements IPosTransactionCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(props: CreatePosTransactionData): Promise<PosTransaction> {
    const raw = await this.db.posTransaction.create({
      data: {
        id: props.id,
        posDeviceId: props.posDeviceId,
        clinicId: props.clinicId,
        patientId: props.patientId,
        appointmentId: props.appointmentId,
        paymentId: props.paymentId,
        amount: props.amount,
        currency: props.currency,
        externalRef: props.externalRef,
        rawRequest: props.rawRequest ?? undefined,
      },
    });
    return new PosTransaction(raw);
  }

  async save(entity: PosTransaction): Promise<PosTransaction> {
    const data = entity.toPersistence();
    const raw = await this.db.posTransaction.update({
      where: { id: data.id },
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
