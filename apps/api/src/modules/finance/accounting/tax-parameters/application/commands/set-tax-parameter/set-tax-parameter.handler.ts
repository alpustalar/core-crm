import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  ITaxParameterCommandRepository,
  ITaxParameterQueryRepository,
  TAX_PARAMETER_COMMAND_REPOSITORY,
  TAX_PARAMETER_QUERY_REPOSITORY,
} from '@modules/finance/accounting/tax-parameters/domain/repositories/tax-parameter.repository';
import { TaxParameter } from '@modules/finance/accounting/tax-parameters/domain/entities/tax-parameter.entity';
import { SetTaxParameterCommand } from './set-tax-parameter.command';

@CommandHandler(SetTaxParameterCommand)
export class SetTaxParameterHandler
  implements ICommandHandler<SetTaxParameterCommand, string>
{
  constructor(
    @Inject(TAX_PARAMETER_COMMAND_REPOSITORY)
    private readonly taxParameterCommandRepo: ITaxParameterCommandRepository,
    @Inject(TAX_PARAMETER_QUERY_REPOSITORY)
    private readonly taxParameterQueryRepo: ITaxParameterQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: SetTaxParameterCommand): Promise<string> {
    const { input } = command;
    const validFrom = input.validFrom ?? new Date();

    return this.txManager.run(async () => {
      // Mevcut açık sürümü yeni geçerlilik tarihinde kapat (ileriye dönük versiyonlama).
      const open = await this.taxParameterQueryRepo.findOpen(
        input.clinicId,
        input.key
      );
      if (open) {
        if (validFrom <= open.validFrom) {
          throw new BadRequestException(
            'Yeni oranın geçerlilik tarihi mevcut açık sürümden sonra olmalıdır.'
          );
        }
        open.close(validFrom);
        await this.taxParameterCommandRepo.save(open);
      }

      const parameter = TaxParameter.create({
        clinicId: input.clinicId,
        organizationId: input.organizationId,
        key: input.key,
        rate: input.rate,
        validFrom,
      });
      const saved = await this.taxParameterCommandRepo.save(parameter);
      return saved.id;
    });
  }
}
