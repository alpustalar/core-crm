import { Injectable } from '@nestjs/common';
import { CommandBus, ICommand } from '@nestjs/cqrs';

@Injectable()
export class TSCommandBus {
  constructor(private readonly commandBus: CommandBus) {}

  async execute<TCommand extends ICommand>(
    command: TCommand
  ): Promise<TCommand extends { __responseType: infer TRes } ? TRes : void> {
    return this.commandBus.execute(command);
  }
}
