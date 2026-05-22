import { Module } from '@nestjs/common';
import {
  USER_COMMAND_REPOSITORY,
  USER_QUERY_REPOSITORY,
} from '@modules/user/domain/repositories/user.repository';
import { UserCommandRepository } from './user.command.repository';
import { UserQueryRepository } from './user.query.repository';

@Module({
  providers: [
    { provide: USER_COMMAND_REPOSITORY, useClass: UserCommandRepository },
    { provide: USER_QUERY_REPOSITORY, useClass: UserQueryRepository },
  ],
  exports: [USER_COMMAND_REPOSITORY, USER_QUERY_REPOSITORY],
})
export class UserRepositoryModule {}
