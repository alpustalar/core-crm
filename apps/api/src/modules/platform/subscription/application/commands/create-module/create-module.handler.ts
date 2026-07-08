import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateModuleCommand } from './create-module.command';
import {
  IModuleCommandRepository,
  MODULE_COMMAND_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/module.repository.interface';
import { Module } from '@modules/platform/subscription/domain/entities/module.entity';
import { SubscriptionModuleAlreadyExistsException } from '@modules/platform/subscription/domain/exceptions/subscription.exceptions';

@CommandHandler(CreateModuleCommand)
export class CreateModuleHandler
  implements ICommandHandler<CreateModuleCommand, string>
{
  constructor(
    @Inject(MODULE_COMMAND_REPOSITORY)
    private readonly moduleCommandRepo: IModuleCommandRepository
  ) {}

  async execute(command: CreateModuleCommand): Promise<string> {
    const module = Module.create({
      key: command.key,
      name: command.name,
      monthlyPrice: command.monthlyPrice,
      currency: command.currency,
      description: command.description ?? null,
    });

    const existing = await this.moduleCommandRepo.findByKey(module.key);
    if (existing) {
      throw new SubscriptionModuleAlreadyExistsException(module.key);
    }

    const saved = await this.moduleCommandRepo.create(module);
    return saved.id.value;
  }
}
