import { Module } from '@nestjs/common';
import { ModuleCommandRepository } from './module.command.repository';
import { MODULE_COMMAND_REPOSITORY } from '@modules/platform/subscription/domain/repositories/module/module.command.repository';

@Module({
  providers: [
    { provide: MODULE_COMMAND_REPOSITORY, useClass: ModuleCommandRepository },
  ],
  exports: [MODULE_COMMAND_REPOSITORY],
})
export class SubscriptionModuleRepositoryModule {}
