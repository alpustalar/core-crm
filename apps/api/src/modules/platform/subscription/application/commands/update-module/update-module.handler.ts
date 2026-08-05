import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateModuleCommand } from './update-module.command';
import {
  IModuleCommandRepository,
  MODULE_COMMAND_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/module.repository.interface';
import { SubscriptionModuleNotFoundException } from '@modules/platform/subscription/domain/exceptions/subscription.exceptions';
import { isNotUndefined } from '@common/utils/is-not-undefined';
import { isDefined } from '@common/utils';

@CommandHandler(UpdateModuleCommand)
export class UpdateModuleHandler implements ICommandHandler<
  UpdateModuleCommand,
  void
> {
  constructor(
    @Inject(MODULE_COMMAND_REPOSITORY)
    private readonly moduleCommandRepo: IModuleCommandRepository
  ) {}

  async execute(command: UpdateModuleCommand): Promise<void> {
    const { payload } = command;
    const module = await this.moduleCommandRepo.findById(payload.moduleId);
    if (!module) {
      throw new SubscriptionModuleNotFoundException(payload.moduleId);
    }

    if (isNotUndefined(payload.monthlyPrice)) {
      module.updatePrice(payload.monthlyPrice, payload.currency);
    }
    if (isDefined(payload.isActive)) {
      if (payload.isActive) {
        module.activate();
      } else {
        module.deactivate();
      }
    }

    await this.moduleCommandRepo.update(module);
  }
}
