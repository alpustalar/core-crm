import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@modules/auth/guards';
import { CapabilityGuard } from '@modules/auth/guards/capability/capability.guard';
import { THROTTLE_CONFIG } from '@common/constants';
import { ChangeUserPasswordDto } from '@shared';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { ChangePasswordCommand } from '@modules/user/application/commands/change-password';
import { SendVerificationEmailCommand } from '@modules/user/application/commands/send-verification-email';
import { SendUserPasswordResetLinkBySelfCommand } from '@modules/user/application/commands/send-user-password-reset-link-by-self';
import { FindOneWithIdOrEmailQuery } from '@modules/user/application/queries/find-one-with-id-or-email';
import { UserTransformInterceptor } from '@modules/user/presentation/user-transform.interceptor';

@UseGuards(AuthGuard, CapabilityGuard)
@Controller('me')
export class MeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @UseInterceptors(UserTransformInterceptor)
  @Version('1')
  @Get('')
  getProfile(@GetContext() context: IGetContext) {
    return this.queryBus.execute(
      new FindOneWithIdOrEmailQuery(context.actor.userId, context)
    );
  }

  @Version('1')
  @Post('email-verify')
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  sendVerificationEmail(@GetContext() context: IGetContext) {
    return this.commandBus.execute(
      new SendVerificationEmailCommand(context.actor.email)
    );
  }

  @Version('1')
  @Patch('change-password')
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  changePassword(
    @Body() dto: ChangeUserPasswordDto,
    @GetContext() context: IGetContext
  ) {
    return this.commandBus.execute(new ChangePasswordCommand(dto, context));
  }

  @Version('1')
  @Post('reset-password')
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  sendResetPasswordEmail(@GetContext() context: IGetContext) {
    return this.commandBus.execute(
      new SendUserPasswordResetLinkBySelfCommand(context)
    );
  }
}
