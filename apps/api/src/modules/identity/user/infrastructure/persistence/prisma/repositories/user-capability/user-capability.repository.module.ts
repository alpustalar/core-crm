import { Module } from '@nestjs/common';
import { USER_CAPABILITY_COMMAND_REPOSITORY } from '@modules/identity/user/domain/repositories/user-capability/user-capability.command.repository';
import { USER_CAPABILITY_QUERY_REPOSITORY } from '@modules/identity/user/domain/repositories/user-capability/user-capability.query.repository';
import { UserCapabilityCommandRepository } from './user-capability.command.repository';
import { UserCapabilityQueryRepository } from './user-capability.query.repository';

@Module({
  providers: [
    {
      provide: USER_CAPABILITY_COMMAND_REPOSITORY,
      useClass: UserCapabilityCommandRepository,
    },
    {
      provide: USER_CAPABILITY_QUERY_REPOSITORY,
      useClass: UserCapabilityQueryRepository,
    },
  ],
  exports: [
    USER_CAPABILITY_COMMAND_REPOSITORY,
    USER_CAPABILITY_QUERY_REPOSITORY,
  ],
})
export class UserCapabilityRepositoryModule {}
