import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReviewAdminRequestCommand } from './review-admin-request.command';
import {
  ADMIN_REQUEST_COMMAND_REPOSITORY,
  ADMIN_REQUEST_QUERY_REPOSITORY,
  IAdminRequestCommandRepository,
  IAdminRequestQueryRepository,
} from '@modules/platform/admin-request/domain/repositories/admin-request.repository.interface';
import { AdminRequestStatus } from '@prisma/client';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(ReviewAdminRequestCommand)
export class ReviewAdminRequestHandler
  implements ICommandHandler<ReviewAdminRequestCommand, void>
{
  constructor(
    @Inject(ADMIN_REQUEST_COMMAND_REPOSITORY)
    private readonly adminRequestCommandRepo: IAdminRequestCommandRepository,
    @Inject(ADMIN_REQUEST_QUERY_REPOSITORY)
    private readonly adminRequestQueryRepo: IAdminRequestQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ReviewAdminRequestCommand): Promise<void> {
    const { requestId, dto, ctx } = command;
    const { actor } = ctx;

    await this.txManager.run(async () => {
      const request = await this.adminRequestQueryRepo.findById(requestId);
      if (!request) throw new NotFoundException('İstek bulunamadı.');

      if (dto.status === AdminRequestStatus.APPROVED) {
        request.approve(actor.userId, dto.reviewNote);
      } else {
        request.reject(actor.userId, dto.reviewNote);
      }

      await this.adminRequestCommandRepo.save(request);
    });
  }
}
