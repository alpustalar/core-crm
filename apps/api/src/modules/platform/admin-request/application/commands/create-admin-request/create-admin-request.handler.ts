import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreateAdminRequestCommand } from './create-admin-request.command';
import {
  ADMIN_REQUEST_COMMAND_REPOSITORY,
  IAdminRequestCommandRepository,
} from '@modules/platform/admin-request/domain/repositories/admin-request.repository.interface';
import { AdminRequest } from '@modules/platform/admin-request/domain/entities/admin-request.entity';
import { AdminRequestType } from '@shared/modules/admin-request/types';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(CreateAdminRequestCommand)
export class CreateAdminRequestHandler
  implements ICommandHandler<CreateAdminRequestCommand, string>
{
  constructor(
    @Inject(ADMIN_REQUEST_COMMAND_REPOSITORY)
    private readonly adminRequestCommandRepo: IAdminRequestCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateAdminRequestCommand): Promise<string> {
    const { dto, ctx } = command;
    const { actor } = ctx;

    return this.txManager.run(async () => {
      const entity = AdminRequest.create({
        id: randomUUID(),
        type: dto.type as AdminRequestType,
        targetId: dto.targetId,
        requestedBy: actor.userId,
        organizationId: actor.organizationId ?? undefined,
      });

      const saved = await this.adminRequestCommandRepo.save(entity);
      return saved.id;
    });
  }
}
