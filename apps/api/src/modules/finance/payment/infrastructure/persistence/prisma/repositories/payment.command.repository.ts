import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Payment } from '@modules/finance/payment/domain/entities/payment.entity';
import { IPaymentCommandRepository } from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';

@Injectable()
export class PaymentCommandRepository
  extends BaseCommandRepository<Payment>
  implements IPaymentCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Payment | null> {
    const raw = await this.db.payment.findUnique({
      where: { id },
      include: { installments: { orderBy: { installmentNo: 'asc' } } },
    });
    return raw ? new Payment(raw) : null;
  }

  async save(entity: Payment): Promise<Payment> {
    const create = entity.toPersistence();

    const { id, ...update } = create;

    const paymentOp = this.db.payment.upsert({
      where: { id },
      create,
      update,
    });
    const installmentOps = entity.installments.map((inst) =>
      this.db.paymentInstallment.upsert({
        where: { id: inst.id },
        create: {
          id: inst.id,
          paymentId: inst.paymentId,
          installmentNo: inst.installmentNo,
          amount: inst.amount,
          currency: inst.currency,
          method: inst.method,
          status: inst.status,
          dueDate: inst.dueDate,
          paidAt: inst.paidAt,
          note: inst.note,
        },
        update: { status: inst.status, paidAt: inst.paidAt },
      })
    );

    if (txStorage.getStore()?.tx) {
      await Promise.all([paymentOp, ...installmentOps]);
    } else {
      await this.prisma.$transaction([paymentOp, ...installmentOps]);
    }

    entity.flushEvents();
    return entity;
  }

  async saveMany(entities: Payment[]): Promise<void> {
    const allOps = entities.flatMap((entity) => {
      const data = entity.toPersistence();
      const paymentOp = this.db.payment.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
      const installmentOps = [...entity.dirtyInstallmentIds].map(
        (installmentId) => {
          const inst = entity.installments.find((i) => i.id === installmentId)!;
          return this.db.paymentInstallment.update({
            where: { id: installmentId },
            data: { status: inst.status, paidAt: inst.paidAt },
          });
        }
      );
      return [paymentOp, ...installmentOps];
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(allOps);
    } else {
      await this.prisma.$transaction(allOps);
    }

    entities.forEach((e) => e.flushEvents());
  }
}
