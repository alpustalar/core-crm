import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectPurchaseRequestCommand } from './reject-purchase-request.command';
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

@CommandHandler(RejectPurchaseRequestCommand)
export class RejectPurchaseRequestHandler
  implements ICommandHandler<RejectPurchaseRequestCommand, void>
{
  constructor(
    @Inject(PURCHASE_REQUEST_COMMAND_REPOSITORY)
    private readonly prCommandRepo: IPurchaseRequestCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: RejectPurchaseRequestCommand): Promise<void> {
    const { requestId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      const request = await this.prCommandRepo.findById(requestId);
      if (!request) throw new PurchaseRequestNotFoundException(requestId);

      this.policyFactory
        .purchasing(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageClinicPurchasing(request.clinicId.value)
        )
        .orThrow('purchase-request.reject');

      request.reject(ctx.actor.userId, data.note);
      await this.prCommandRepo.save(request);
    });
  }
}
