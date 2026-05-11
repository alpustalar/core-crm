import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { HasCapability } from '@common/decorators';
import { AuthGuard } from '@modules/auth/guards';
import { CapabilityGuard } from '@modules/auth/guards/capability/capability.guard';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import { THROTTLE_CONFIG } from '@common/constants';
import { CreateUserDto } from '@shared';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { CreateUserCommand } from '@modules/user/application/commands/create-user';
import { CheckEmailExistsQuery } from '@modules/user/application/queries/check-email-exists';

const { USER } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@HasCapability(USER.create)
@Controller('registry')
export class RegistryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post('')
  @Version('1')
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  create(@Body() dto: CreateUserDto, @GetContext() context: IGetContext) {
    return this.commandBus.execute(new CreateUserCommand(dto, context));
  }

  @Post('check-email')
  @Version('1')
  @Throttle(THROTTLE_CONFIG.EMAIL_CHECK)
  checkEmail(@Body('email') email: string) {
    return this.queryBus.execute(new CheckEmailExistsQuery(email));
  }
}
