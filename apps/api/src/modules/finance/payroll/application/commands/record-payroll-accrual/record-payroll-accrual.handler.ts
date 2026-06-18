import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { DateTimeManager } from '@common/utils';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { EnsurePartyForEmployeeCommand } from '@modules/finance/party/application/commands/ensure-party-for-employee/ensure-party-for-employee.command';
import { RecordFinancialEventCommand } from '@modules/finance/accounting/financial-events/application/commands/record-financial-event/record-financial-event.command';
import { FinancialEventTypeSchema } from '@shared';
import { RecordPayrollAccrualCommand } from './record-payroll-accrual.command';

@CommandHandler(RecordPayrollAccrualCommand)
export class RecordPayrollAccrualHandler
  implements ICommandHandler<RecordPayrollAccrualCommand, string>
{
  constructor(
    private readonly txManager: TransactionManager,
    private readonly commandBus: TSCommandBus
  ) {}

  async execute(command: RecordPayrollAccrualCommand): Promise<string> {
    const { dto, ctx } = command;
    const clinicId = ctx.actor.clinicId;
    const organizationId = ctx.actor.organizationId;
    if (!clinicId || !organizationId) {
      throw new BadRequestException('Aktörün clinic/organization bağlamı yok.');
    }

    const gross = new Decimal(dto.grossSalary);
    const net = new Decimal(dto.netPayable);
    const taxWithholding = new Decimal(dto.taxWithholding);
    const employeeSgk = new Decimal(dto.employeeSgk);
    const employerSgk = new Decimal(dto.employerSgk);

    // Brüt = net + GV stopajı + işçi SGK. Sağlanmazsa fiş dengesiz olur → erken reddet.
    const decomposed = net.plus(taxWithholding).plus(employeeSgk);
    if (!gross.equals(decomposed)) {
      throw new BadRequestException(
        `Bordro dengesiz: brüt (${gross.toFixed(2)}) = net + stopaj + işçi SGK (${decomposed.toFixed(2)}) olmalı.`
      );
    }

    // Köprü kritik (finansal kayıt) → outboxRun ile atomik. Persist edilen başka kayıt
    // yok; köprü hatası komutu hataya düşürür (kısmi durum oluşmaz).
    return this.txManager.outboxRun(async () => {
      const { partyId } = await this.commandBus.execute(
        new EnsurePartyForEmployeeCommand(
          dto.employeeUserId,
          clinicId,
          organizationId,
          ctx
        )
      );

      const monthKey = DateTimeManager.toMonthKey(dto.accrualDate);

      return this.commandBus.execute(
        new RecordFinancialEventCommand(
          {
            organizationId,
            clinicId,
            type: FinancialEventTypeSchema.enum.PAYROLL_ACCRUED,
            occurredAt: dto.accrualDate,
            payload: {
              partyId,
              grossSalary: gross.toFixed(2),
              employerSgk: employerSgk.toFixed(2),
              netPayable: net.toFixed(2),
              taxWithholding: taxWithholding.toFixed(2),
              employeeSgk: employeeSgk.toFixed(2),
            },
            sourceModule: 'payroll',
            sourceRefId: dto.employeeUserId,
            dedupeKey: `payroll-accrual:${dto.employeeUserId}:${monthKey}`,
          },
          ctx
        )
      );
    });
  }
}
