import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApprovePurchaseRequestCommand } from './approve-purchase-request.command';
import {
  IPurchaseRequestCommandRepository,
  PURCHASE_REQUEST_COMMAND_REPOSITORY,
} from '@modules/supply/purchasing/domain/repositories/purchase-request.repository';
import { PurchaseRequestNotFoundException } from '@modules/supply/purchasing/domain/exceptions/purchasing.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(ApprovePurchaseRequestCommand)
export class ApprovePurchaseRequestHandler implements ICommandHandler<
  ApprovePurchaseRequestCommand,
  void
> {
  constructor(
    @Inject(PURCHASE_REQUEST_COMMAND_REPOSITORY)
    private readonly prCommandRepo: IPurchaseRequestCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ApprovePurchaseRequestCommand): Promise<void> {
    const { requestId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      const request = await this.prCommandRepo.findByIdForUpdate(requestId);
      if (!request) throw new PurchaseRequestNotFoundException(requestId);

      this.policyFactory
        .purchasing(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageClinicPurchasing(request.clinicId.value)
        )
        .orThrow('purchase-request.approve');

      request.approve(ctx.actor.userId, data.note);
      await this.prCommandRepo.update(request);
    });
  }
}
