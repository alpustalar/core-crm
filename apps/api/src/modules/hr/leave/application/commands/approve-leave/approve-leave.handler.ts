// TODO: KRİTİK: Bakiye kontrolünü yaparken doğrudan çalışanın o yılki annualLeaveEntitlement alanına bakıp, sadece currentYear (2026) içerisindeki onaylanmış izinleri düşülmüş:
// TODO: Türkiye İş Kanunu (4857 Sayılı Kanun, Madde 53-54) ve genel İK pratiklerine göre: Geçmiş Yıldan Devreden İzinler: Çalışan 2025 yılından 5 gün izin devrettiyse ve 2026 hakkı 14 günse, toplam hakkı 19 gündür. Sadece currentYear hakkına bakmak çalışanın geçmişten devreden kazanılmış hakkını (accrual balance) gasp eder.Yıl Aşan İzinler (Cross-Year Leaves): İzin 28 Aralık 2026'da başlayıp 5 Ocak 2027'de bitiyorsa, startOfYear ve endOfYear filtresi bu iznin 2027'ye sarkan günlerini hesaptan düşürürken veya yılı sorgularken takvim sınırına takılabilir.Çözüm: İzin bakiyesi kontrolü için tekil bir annualLeaveEntitlement sayısı yerine, İK modülünden çalışanın aktif kullanılabilir toplam bakiyesini (Accrued/Remaining Balance) veren bir servis/query çağırmak ya da devreden bakiyeyi hesaba katmak şarttır.

import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApproveLeaveCommand } from './approve-leave.command';
import {
  ILeaveCommandRepository,
  ILeaveQueryRepository,
  LEAVE_COMMAND_REPOSITORY,
  LEAVE_QUERY_REPOSITORY,
} from '@modules/hr/leave/domain/repositories/leave.repository';
import {
  LeaveInsufficientBalanceException,
  LeaveNotFoundException,
} from '@modules/hr/leave/domain/exceptions/leave.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetEmployeeByIdQuery } from '@modules/hr/employee/application/queries/get-employee-by-id/get-employee-by-id.query';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { LeaveBalance } from '@modules/hr/leave/domain/value-objects/leave-balance.vo';
import { LEAVE_EVENTS } from '@src/domain/constants/events';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';

@CommandHandler(ApproveLeaveCommand)
export class ApproveLeaveHandler implements ICommandHandler<
  ApproveLeaveCommand,
  void
> {
  public internalCtx: IGetContext;
  constructor(
    @Inject(LEAVE_COMMAND_REPOSITORY)
    private readonly leaveCommandRepo: ILeaveCommandRepository,
    @Inject(LEAVE_QUERY_REPOSITORY)
    private readonly leaveQueryRepo: ILeaveQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ApproveLeaveCommand): Promise<void> {
    const { leaveId, data, ctx } = command.payload;
    this.internalCtx = ExecutionContextFactory.createInternal(ctx);

    await this.txManager.run(async () => {
      const leave = await this.leaveCommandRepo.findById(leaveId);
      if (!leave) throw new LeaveNotFoundException(leaveId);

      this.policyFactory
        .employee(ctx.actor, ctx.source)
        .evaluator.check((p) => p.canManageClinicHr(leave.clinicId.value))
        .orThrow(LEAVE_EVENTS.APPROVED);

      // Yıllık izinde kalan bakiye kontrolü — negatife düşürülemez.
      if (leave.validate.type.isAnnual().value) {
        await this.assertAnnualBalance(leave.employeeId.value, leave.days);
      }

      const validateOptions = this.policyFactory
        .entity(ctx.actor, ctx.source)
        .policy.getValidateOptions();

      leave.rules(validateOptions).approve();

      leave.approve(ctx.actor.userId, data.note);

      await this.leaveCommandRepo.update(leave);
    });
  }

  private async assertAnnualBalance(
    employeeId: string,
    requestedDays: number
  ): Promise<void> {
    const { data: employee } = await this.queryBus.execute(
      new GetEmployeeByIdQuery(employeeId, this.internalCtx)
    );

    // İzin yılı + bakiye aritmetiği domain'de (LeaveBalance) — bakiye sorgusuyla
    // birebir aynı hesap; iki yerde ayrı ayrı yazılmaz.
    const { from, to } = LeaveBalance.periodOf();
    const usedDays = await this.leaveQueryRepo.sumApprovedAnnualDays(
      employeeId,
      from,
      to
    );

    const balance = LeaveBalance.calculate({
      entitlement: employee?.annualLeaveEntitlement ?? 0,
      usedDays,
    });

    if (balance.exceeds(requestedDays)) {
      throw new LeaveInsufficientBalanceException(
        requestedDays,
        balance.remaining
      );
    }
  }
}
