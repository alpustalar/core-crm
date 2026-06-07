import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { HasCapability } from '@common/decorators';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { CapabilityGuard } from '@modules/identity/auth/auth/guards/capability/capability.guard';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import { THROTTLE_CONFIG } from '@common/constants';
import { CreateUserDto } from '@shared';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { CreateUserCommand } from '@modules/identity/user/application/commands/create-user';
import { CheckEmailExistsQuery } from '@modules/identity/user/application/queries/check-email-exists';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

const { USER } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@HasCapability(USER.create)
@Controller('registry')
export class RegistryController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post('')
  @Version('1')
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  create(@Body() dto: CreateUserDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateUserCommand(dto, ctx));
  }

  @Post('check-email')
  @Version('1')
  @Throttle(THROTTLE_CONFIG.EMAIL_CHECK)
  checkEmail(@Body('email') email: string) {
    return this.queryBus.execute(new CheckEmailExistsQuery(email));
  }
}
