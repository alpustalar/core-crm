import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAdminRequestCommand } from './create-admin-request.command';
import { AdminRequest } from '@modules/platform/admin-request/domain/entities/admin-request.entity';
import { AdminRequestType } from '@shared/modules/admin-request/types';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  ADMIN_REQUEST_COMMAND_REPOSITORY,
  IAdminRequestCommandRepository,
} from '@modules/platform/admin-request/domain/repositories/admin-request/admin-request.command.repository';

@CommandHandler(CreateAdminRequestCommand)
export class CreateAdminRequestHandler
  implements ICommandHandler<CreateAdminRequestCommand, string>
{
  constructor(
    @Inject(ADMIN_REQUEST_COMMAND_REPOSITORY)
    private readonly adminRequestRepo: IAdminRequestCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateAdminRequestCommand): Promise<string> {
    const { data, ctx } = command;
    const { actor } = ctx;

    return this.txManager.run(async () => {
      const entity = AdminRequest.create({
        type: data.type as AdminRequestType,
        targetId: data.targetId,
        requestedBy: actor.userId,
        organizationId: actor.organizationId ?? undefined,
        clinicId: actor.clinicId ?? undefined,
      });

      const saved = await this.adminRequestRepo.create(entity);
      return saved.id.value;
    });
  }
}
