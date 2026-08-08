import { Module } from '@nestjs/common';
import { UserCommandRepository } from './user.command.repository';
import { UserQueryRepository } from './user.query.repository';
import { USER_COMMAND_REPOSITORY } from '@modules/identity/user/domain/repositories/user/user.command.repository';
import { USER_QUERY_REPOSITORY } from '@modules/identity/user/domain/repositories/user/user.query.repository';

@Module({
  providers: [
    { provide: USER_COMMAND_REPOSITORY, useClass: UserCommandRepository },
    { provide: USER_QUERY_REPOSITORY, useClass: UserQueryRepository },
  ],
  exports: [USER_COMMAND_REPOSITORY, USER_QUERY_REPOSITORY],
})
export class UserRepositoryModule {}
