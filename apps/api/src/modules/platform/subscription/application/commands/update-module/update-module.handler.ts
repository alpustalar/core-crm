import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateModuleCommand } from './update-module.command';
import {
  IModuleCommandRepository,
  MODULE_COMMAND_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/module.repository.interface';
import { SubscriptionModuleNotFoundException } from '@modules/platform/subscription/domain/exceptions/subscription.exceptions';

@CommandHandler(UpdateModuleCommand)
export class UpdateModuleHandler
  implements ICommandHandler<UpdateModuleCommand, void>
{
  constructor(
    @Inject(MODULE_COMMAND_REPOSITORY)
    private readonly moduleCommandRepo: IModuleCommandRepository
  ) {}

  async execute(command: UpdateModuleCommand): Promise<void> {
    const module = await this.moduleCommandRepo.findById(command.moduleId);
    if (!module) {
      throw new SubscriptionModuleNotFoundException(command.moduleId);
    }

    if (command.monthlyPrice !== undefined) {
      module.updatePrice(command.monthlyPrice, command.currency);
    }
    if (command.isActive !== undefined) {
      command.isActive ? module.activate() : module.deactivate();
    }

    await this.moduleCommandRepo.save(module);
  }
}
