import { Module } from '@nestjs/common';
import { MODULE_COMMAND_REPOSITORY } from '@modules/platform/subscription/domain/repositories/module.repository.interface';
import { ModuleCommandRepository } from './module.command.repository';

@Module({
  providers: [
    { provide: MODULE_COMMAND_REPOSITORY, useClass: ModuleCommandRepository },
  ],
  exports: [MODULE_COMMAND_REPOSITORY],
})
export class SubscriptionModuleRepositoryModule {}
