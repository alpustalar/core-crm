import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RecordCashMovementCommand } from './record-cash-movement.command';
import {
  CASH_SESSION_COMMAND_REPOSITORY,
  ICashSessionCommandRepository,
} from '@modules/finance/cash-register/domain/repositories/cash-session.repository';
import {
  CASH_MOVEMENT_COMMAND_REPOSITORY,
  ICashMovementCommandRepository,
} from '@modules/finance/cash-register/domain/repositories/cash-movement.repository';
import { CashMovement } from '@modules/finance/cash-register/domain/entities/cash-movement.entity';
import { CashSessionNotFoundException } from '@modules/finance/cash-register/domain/exceptions/cash-register.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CASH_REGISTER_EVENTS } from '@src/domain/constants/events/cash-register.constant';

@CommandHandler(RecordCashMovementCommand)
export class RecordCashMovementHandler implements ICommandHandler<
  RecordCashMovementCommand,
  void
> {
  constructor(
    @Inject(CASH_SESSION_COMMAND_REPOSITORY)
    private readonly sessionCommandRepo: ICashSessionCommandRepository,
    @Inject(CASH_MOVEMENT_COMMAND_REPOSITORY)
    private readonly movementCommandRepo: ICashMovementCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: RecordCashMovementCommand): Promise<void> {
    const { sessionId, data, ctx } = command.payload;

    // Oturumu FOR UPDATE ile kilitle: hareket kaydı ile eşzamanlı kapanışı
    // serialize eder — kapanış-anında-hareket (kapanış sayımını bozan yarış) önlenir.
    await this.txManager.run(async () => {
      const session =
        await this.sessionCommandRepo.findByIdForUpdate(sessionId);
      if (!session) throw new CashSessionNotFoundException(sessionId);

      this.policyFactory
        .finance(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageClinicFinances(session.clinicId.value)
        )
        .orThrow(CASH_REGISTER_EVENTS.MOVEMENT_RECORD);

      // Yalnızca açık oturuma hareket kaydedilebilir (domain invariantı).
      session.assertOpen();

      const movement = CashMovement.record({
        cashSessionId: session.id.value,
        clinicId: session.clinicId.value,
        organizationId: session.organizationId.value,
        type: data.type,
        amount: data.amount,
        currency: session.currency,
        description: data.description,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        performedById: ctx.actor.userId,
      });

      await this.movementCommandRepo.create(movement);
    });
  }
}
