import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPosTransactionCommandRepository } from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
import { CreatePosTransactionProps } from '@modules/finance/pos/physical/domain/types/create-pos-transaction.props';
import { PosTransactionEntity } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';

@Injectable()
export class PosTransactionCommandRepository
  extends BaseRepository
  implements IPosTransactionCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(
    props: CreatePosTransactionProps
  ): Promise<PosTransactionEntity> {
    const raw = await this.db.posTransaction.create({
      data: {
        id: props.id,
        posDeviceId: props.posDeviceId,
        clinicId: props.clinicId,
        patientId: props.patientId,
        appointmentId: props.appointmentId,
        paymentId: props.paymentId,
        amount: props.amount,
        currency: props.currency ?? 'TRY',
        externalRef: props.externalRef,
        rawRequest: props.rawRequest ?? undefined,
      },
    });
    return new PosTransactionEntity(raw);
  }

  async save(entity: PosTransactionEntity): Promise<PosTransactionEntity> {
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
    return new PosTransactionEntity(raw);
  }
}
