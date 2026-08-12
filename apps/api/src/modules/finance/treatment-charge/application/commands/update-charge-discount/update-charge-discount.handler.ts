import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Decimal } from 'decimal.js';
import { UpdateChargeDiscountCommand } from './update-charge-discount.command';
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
import { GetClinicFinanceSettingsQuery } from '@modules/organization/clinic/application/queries/get-clinic-finance-settings/get-clinic-finance-settings.query';
import { GetInvoiceByAppointmentIdQuery } from '@modules/finance/invoice/application/queries/get-invoice-by-appointment-id/get-invoice-by-appointment-id.query';
import { TREATMENT_CHARGE_EVENTS } from '@src/domain/constants/events';

/**
 * Satırın indirimini değiştirir. Liste fiyatı ve KDV oranına dokunulmaz —
 * pazarlık payı yalnız indirimdir; fiyatın kendisi satır doğduğunda dondu.
 */
@CommandHandler(UpdateChargeDiscountCommand)
export class UpdateChargeDiscountHandler
  implements ICommandHandler<UpdateChargeDiscountCommand, void>
{
  constructor(
    @Inject(TREATMENT_CHARGE_COMMAND_REPOSITORY)
    private readonly chargeRepo: ITreatmentChargeCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateChargeDiscountCommand): Promise<void> {
    const { chargeId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      // Mutasyon kararını besleyen okuma Command Repo'dan (aynı tx kapsamı).
      const charge = await this.chargeRepo.findById(chargeId);
      if (!charge) throw new TreatmentChargeNotFoundException(chargeId);

      const { evaluator, policy } = this.policyFactory.finance(
        ctx.actor,
        ctx.source
      );

      evaluator
        .check(
          (p) => p.canAccessClinicFinances(charge.clinicId.value),
          'Bu işlem satırının indirimini değiştirme yetkiniz yok.'
        )
        .orThrow(TREATMENT_CHARGE_EVENTS.DISCOUNT_UPDATED);

      const { data: invoice } = await this.queryBus.execute(
        new GetInvoiceByAppointmentIdQuery(charge.appointmentId.value)
      );
      if (invoice) {
        throw new TreatmentChargeAlreadyInvoicedException(
          charge.appointmentId.value
        );
      }

      const { data: settings } = await this.queryBus.execute(
        new GetClinicFinanceSettingsQuery(charge.clinicId.value)
      );

      charge.applyDiscount({
        discountRate: new Decimal(data.discountRate),
        discountReason: data.discountReason ?? null,
        maxDiscountPercent: settings
          ? new Decimal(settings.maxDiscountPercent)
          : new Decimal(0),
        canExceedDiscountLimit: policy.actorCanManageTargetClinic(
          charge.clinicId.value
        ),
        actorId: ctx.actor.userId,
      });

      await this.chargeRepo.update(charge);
    });
  }
}
