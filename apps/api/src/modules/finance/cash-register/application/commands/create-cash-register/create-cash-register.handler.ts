import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCashRegisterCommand } from './create-cash-register.command';
import {
  CASH_REGISTER_COMMAND_REPOSITORY,
  ICashRegisterCommandRepository,
} from '@modules/finance/cash-register/domain/repositories/cash-register.repository';
import { CashRegister } from '@modules/finance/cash-register/domain/entities/cash-register.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CASH_REGISTER_EVENTS } from '@src/domain/constants/events/cash-register.constant';

@CommandHandler(CreateCashRegisterCommand)
export class CreateCashRegisterHandler implements ICommandHandler<
  CreateCashRegisterCommand,
  string
> {
  constructor(
    @Inject(CASH_REGISTER_COMMAND_REPOSITORY)
    private readonly registerCommandRepo: ICashRegisterCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateCashRegisterCommand): Promise<string> {
    const { data, ctx } = command;
    const { actor } = ctx;

    const clinicId = actor.clinicId ?? '';
    const organizationId =
      actor.organizationId ?? actor.ownedOrganizations?.[0]?.id ?? '';

    this.policyFactory
      .finance(actor, ctx.source)
      .evaluator.check((p) => p.canManageClinicFinances(clinicId))
      .orThrow(CASH_REGISTER_EVENTS.CREATED);

    const register = CashRegister.create({
      clinicId,
      organizationId,
      name: data.name,
      currency: data.currency,
    });

    return this.txManager.run(async () => {
      const saved = await this.registerCommandRepo.create(register);
      return saved.id.value;
    });
  }
}
