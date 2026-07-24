import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelPurchaseRequestCommand } from './cancel-purchase-request.command';
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

@CommandHandler(CancelPurchaseRequestCommand)
export class CancelPurchaseRequestHandler
  implements ICommandHandler<CancelPurchaseRequestCommand, void>
{
  constructor(
    @Inject(PURCHASE_REQUEST_COMMAND_REPOSITORY)
    private readonly prCommandRepo: IPurchaseRequestCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CancelPurchaseRequestCommand): Promise<void> {
    const { requestId, ctx } = command;

    await this.txManager.run(async () => {
      const request = await this.prCommandRepo.findById(requestId);
      if (!request) throw new PurchaseRequestNotFoundException(requestId);

      this.policyFactory
        .purchasing(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canAccessClinicPurchasing(request.clinicId.value)
        )
        .orThrow('purchase-request.cancel');

      request.cancel();
      await this.prCommandRepo.save(request);
    });
  }
}
