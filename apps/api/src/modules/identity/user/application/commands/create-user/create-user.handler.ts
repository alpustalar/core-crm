import { CreateUserCommand } from '@modules/identity/user/application/commands/create-user/create-user.command';
import { CreateUserResponse } from '@modules/identity/user/application/commands/create-user/create-user.response';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import { User } from '@modules/identity/user/domain/entities/user.entity';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalOnly } from '@common/decorators';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler
  implements ICommandHandler<CreateUserCommand, CreateUserResponse>
{
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userCommandRepo: IUserCommandRepository
  ) {}

  // Register işlemi registration modülünde yapılır
  @InternalOnly()
  async execute(command: CreateUserCommand): Promise<string> {
    const { data } = command;
    const user = User.create({
      id: data.firebaseUid,
      email: data.email,
      displayName: data.displayName,
      picture: data.picture,
      roleId: data.roleId,
      clinicId: data.clinicId,
      ownedOrganizationIds: data?.ownedOrganizationIds,
      managedClinicIds: data?.managedClinicIds,
    });

    const saved = await this.userCommandRepo.create(user);
    return saved.id.value;
  }
}
