import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VoidTreatmentChargeCommand } from './void-treatment-charge.command';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  ITreatmentChargeCommandRepository,
  TREATMENT_CHARGE_COMMAND_REPOSITORY,
} from '@modules/finance/treatment-charge/domain/repositories/treatment-charge/treatment-charge.command.repository';
import {
  TreatmentChargeAlreadyInvoicedException,
  TreatmentChargeNotFoundException,
} from '@modules/finance/treatment-charge/domain/exceptions/treatment-charge.exceptions';
import { GetInvoiceByAppointmentIdQuery } from '@modules/finance/invoice/application/queries/get-invoice-by-appointment-id/get-invoice-by-appointment-id.query';
import { TREATMENT_CHARGE_EVENTS } from '@src/domain/constants/events';

/**
 * Satırı iptal eder. Silme yerine iptal: kayıt kalır, toplamlardan düşer —
 * "bu işlem neden faturaya girmedi" sorusunun cevabı kaybolmasın diye.
 */
@CommandHandler(VoidTreatmentChargeCommand)
export class VoidTreatmentChargeHandler
  implements ICommandHandler<VoidTreatmentChargeCommand, void>
{
  constructor(
    @Inject(TREATMENT_CHARGE_COMMAND_REPOSITORY)
    private readonly chargeRepo: ITreatmentChargeCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: VoidTreatmentChargeCommand): Promise<void> {
    const { chargeId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      const charge = await this.chargeRepo.findById(chargeId);
      if (!charge) throw new TreatmentChargeNotFoundException(chargeId);

      this.policyFactory
        .finance(ctx.actor, ctx.source)
        .evaluator.check(
          (p) => p.canAccessClinicFinances(charge.clinicId.value),
          'Bu işlem satırını iptal etme yetkiniz yok.'
        )
        .orThrow(TREATMENT_CHARGE_EVENTS.VOIDED);

      const { data: invoice } = await this.queryBus.execute(
        new GetInvoiceByAppointmentIdQuery(charge.appointmentId.value)
      );
      if (invoice) {
        throw new TreatmentChargeAlreadyInvoicedException(
          charge.appointmentId.value
        );
      }

      charge.void({ reason: data.reason });

      await this.chargeRepo.update(charge);
    });
  }
}
