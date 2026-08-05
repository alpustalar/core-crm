import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  ITaxParameterCommandRepository,
  ITaxParameterQueryRepository,
  TAX_PARAMETER_COMMAND_REPOSITORY,
  TAX_PARAMETER_QUERY_REPOSITORY,
} from '@modules/finance/accounting/tax-parameters/domain/repositories/tax-parameter.repository';
import { TaxParameter } from '@modules/finance/accounting/tax-parameters/domain/entities/tax-parameter.entity';
import { TAX_PARAMETER_DEFAULTS } from '@modules/finance/accounting/tax-parameters/domain/constants/tax-parameter-defaults';
import { InitializeTaxParametersCommand } from './initialize-tax-parameters.command';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

/**
 * Şube açılışında varsayılan vergi oranlarını kurar. İdempotent: parametre
 * zaten varsa hiçbir şey yapmaz (register-clinic saga'sından çağrılır).
 */
@CommandHandler(InitializeTaxParametersCommand)
export class InitializeTaxParametersHandler implements ICommandHandler<
  InitializeTaxParametersCommand,
  void
> {
  constructor(
    @Inject(TAX_PARAMETER_COMMAND_REPOSITORY)
    private readonly taxParameterCommandRepo: ITaxParameterCommandRepository,
    @Inject(TAX_PARAMETER_QUERY_REPOSITORY)
    private readonly taxParameterQueryRepo: ITaxParameterQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: InitializeTaxParametersCommand): Promise<void> {
    const { clinicId, organizationId, ctx } = command;

    const alreadyInitialized =
      await this.taxParameterQueryRepo.existsForClinic(clinicId);
    if (alreadyInitialized) return;

    const validFrom = DateTimeManager.create();
    const parameters = TAX_PARAMETER_DEFAULTS.map((def) =>
      TaxParameter.create({
        clinicId,
        organizationId,
        key: def.key,
        rate: def.rate,
        validFrom,
      })
    );

    await this.txManager.run(() =>
      this.taxParameterCommandRepo.updateMany(parameters)
    );
  }
}
