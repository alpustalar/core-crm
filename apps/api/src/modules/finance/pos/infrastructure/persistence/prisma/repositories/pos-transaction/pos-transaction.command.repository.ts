import { Injectable } from '@nestjs/common';
import { PosTransaction, PosTransactionStatus } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPosTransactionCommandRepository } from '@modules/finance/pos/domain/repositories/pos-transaction.repository';
import { CreatePosTransactionProps } from '@modules/finance/pos/domain/types/create-pos-transaction.props';

@Injectable()
export class PosTransactionCommandRepository
  extends BaseRepository
  implements IPosTransactionCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(props: CreatePosTransactionProps): Promise<PosTransaction> {
    return this.db.posTransaction.create({
      data: {
        id: props.id,
        posDeviceId: props.posDeviceId,
        clinicId: props.clinicId,
        patientId: props.patientId,
        appointmentId: props.appointmentId,
        paymentId: props.paymentId,
        amount: props.amount,
        currency: props.currency ?? 'TRY',
        rawRequest: props.rawRequest ?? undefined,
      },
    });
  }

  updateStatus(props: {
    id: string;
    status: PosTransactionStatus;
    externalRef?: string;
    rawResponse?: unknown;
    completedAt?: Date;
  }): Promise<PosTransaction> {
    return this.db.posTransaction.update({
      where: { id: props.id },
      data: {
        status: props.status,
        externalRef: props.externalRef,
        rawResponse: props.rawResponse ?? undefined,
        completedAt: props.completedAt,
      },
    });
  }

  setExternalRef(props: {
    id: string;
    externalRef: string;
    rawRequest?: unknown;
  }): Promise<PosTransaction> {
    return this.db.posTransaction.update({
      where: { id: props.id },
      data: {
        externalRef: props.externalRef,
        rawRequest: props.rawRequest ?? undefined,
      },
    });
  }
}
