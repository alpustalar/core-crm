import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CashRegisterStatusSchema } from '@input-type-schemas/CashRegisterStatusSchema';
import { OpenCashSessionCommand } from './open-cash-session.command';
import {
  CASH_REGISTER_COMMAND_REPOSITORY,
  ICashRegisterCommandRepository,
} from '@modules/finance/cash-register/domain/repositories/cash-register.repository';
import {
  CASH_SESSION_COMMAND_REPOSITORY,
  ICashSessionCommandRepository,
} from '@modules/finance/cash-register/domain/repositories/cash-session.repository';
import { CashSession } from '@modules/finance/cash-register/domain/entities/cash-session.entity';
import {
  CashRegisterArchivedException,
  CashRegisterNotFoundException,
  CashSessionAlreadyOpenException,
} from '@modules/finance/cash-register/domain/exceptions/cash-register.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CASH_REGISTER_EVENTS } from '@src/domain/constants/events/cash-register.constant';

@CommandHandler(OpenCashSessionCommand)
export class OpenCashSessionHandler implements ICommandHandler<
  OpenCashSessionCommand,
  string
> {
  constructor(
    @Inject(CASH_REGISTER_COMMAND_REPOSITORY)
    private readonly registerCommandRepo: ICashRegisterCommandRepository,
    @Inject(CASH_SESSION_COMMAND_REPOSITORY)
    private readonly sessionCommandRepo: ICashSessionCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: OpenCashSessionCommand): Promise<string> {
    const { data, ctx } = command;
    const { actor } = ctx;

    return this.txManager.run(async () => {
      // Kasayı FOR UPDATE ile kilitle: eşzamanlı ikinci açılış ilk tx commit olana
      // kadar bloklanır; "açık oturum var mı?" kontrolü + create bu kilit altında
      // serialize edilir → tek-açık-oturum kuralının çift-açılış yarışı önlenir.
      const register = await this.registerCommandRepo.findByIdForUpdate(
        data.cashRegisterId
      );
      if (!register) {
        throw new CashRegisterNotFoundException(data.cashRegisterId);
      }

      this.policyFactory
        .finance(actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageClinicFinances(register.clinicId.value)
        )
        .orThrow(CASH_REGISTER_EVENTS.OPENED);

      if (register.status === CashRegisterStatusSchema.enum.ARCHIVED) {
        throw new CashRegisterArchivedException(register.id.value);
      }

      // Lock-guarded mutasyon kararı → Command Repo (CQRS: yazma tarafında state'i
      // belirleyen okuma daima command repo'dan, tx/kilit bütünlüğü için).
      const openSession = await this.sessionCommandRepo.findOpenByRegister(
        register.id.value
      );
      if (openSession) {
        throw new CashSessionAlreadyOpenException({
          cashRegisterId: register.id.value,
          openSessionId: openSession.id,
        });
      }

      const session = CashSession.open({
        cashRegisterId: register.id.value,
        clinicId: register.clinicId.value,
        organizationId: register.organizationId.value,
        currency: register.currency,
        openingFloat: data.openingFloat,
        openedById: actor.userId,
        note: data.note,
      });

      const saved = await this.sessionCommandRepo.create(session);
      return saved.id.value;
    });
  }
}
