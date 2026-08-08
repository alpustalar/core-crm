import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReviewAdminRequestCommand } from './review-admin-request.command';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { AdminRequestStatusSchema } from '@shared';
import {
  ADMIN_REQUEST_COMMAND_REPOSITORY,
  IAdminRequestCommandRepository,
} from '@modules/platform/admin-request/domain/repositories/admin-request/admin-request.command.repository';

@CommandHandler(ReviewAdminRequestCommand)
export class ReviewAdminRequestHandler
  implements ICommandHandler<ReviewAdminRequestCommand, void>
{
  constructor(
    @Inject(ADMIN_REQUEST_COMMAND_REPOSITORY)
    private readonly adminRequestRepo: IAdminRequestCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ReviewAdminRequestCommand): Promise<void> {
    const { requestId, data, ctx } = command.payload;
    const { actor } = ctx;

    await this.txManager.run(async () => {
      const request = await this.adminRequestRepo.findById(requestId);
      if (!request) throw new NotFoundException('İstek bulunamadı.');

      if (data.status === AdminRequestStatusSchema.enum.APPROVED) {
        request.approve(actor.userId, data.reviewNote);
      } else {
        request.reject(actor.userId, data.reviewNote);
      }

      await this.adminRequestRepo.update(request);
    });
  }
}
