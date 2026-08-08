import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TaxParameter } from '@modules/finance/accounting/tax-parameters/domain/entities/tax-parameter.entity';
import { SetTaxParameterCommand } from './set-tax-parameter.command';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import {
  ITaxParameterCommandRepository,
  TAX_PARAMETER_COMMAND_REPOSITORY,
} from '@modules/finance/accounting/tax-parameters/domain/repositories/tax-parameter/tax-parameter.command.repository';

@CommandHandler(SetTaxParameterCommand)
export class SetTaxParameterHandler
  implements ICommandHandler<SetTaxParameterCommand, string>
{
  constructor(
    @Inject(TAX_PARAMETER_COMMAND_REPOSITORY)
    private readonly taxParameterRepo: ITaxParameterCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: SetTaxParameterCommand): Promise<string> {
    const { input } = command;
    const validFrom = input.validFrom ?? DateTimeManager.create();

    return this.txManager.run(async () => {
      // Mevcut açık sürümü yeni geçerlilik tarihinde kapat (ileriye dönük versiyonlama).
      // Kilitli okunur: satır kapatılacağı ve yerine yenisi açılacağı için eşzamanlı
      // ikinci istek bu tx commit olmadan aynı açık sürümü göremez.
      const open = await this.taxParameterRepo.findOpenForUpdate(
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
        await this.taxParameterRepo.update(open);
      }

      const parameter = TaxParameter.create({
        clinicId: input.clinicId,
        organizationId: input.organizationId,
        key: input.key,
        rate: input.rate,
        validFrom,
      });
      const saved = await this.taxParameterRepo.create(parameter);
      return saved.id;
    });
  }
}
