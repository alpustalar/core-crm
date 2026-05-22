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
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@UseGuards(AuthGuard, CapabilityGuard)
@Controller('me')
export class MeController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @UseInterceptors(UserTransformInterceptor)
  @Version('1')
  @Get('')
  getProfile(@GetContext() ctx: IGetContext) {
    return this.queryBus.execute(
      new FindOneWithIdOrEmailQuery(ctx.actor.userId, ctx)
    );
  }

  @Version('1')
  @Post('email-verify')
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  sendVerificationEmail(@GetContext() ctx: IGetContext) {
    return this.commandBus.execute(
      new SendVerificationEmailCommand(ctx.actor.email)
    );
  }

  @Version('1')
  @Patch('change-password')
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  changePassword(
    @Body() dto: ChangeUserPasswordDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new ChangePasswordCommand(dto, ctx));
  }

  @Version('1')
  @Post('reset-password')
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  sendResetPasswordEmail(@GetContext() ctx: IGetContext) {
    return this.commandBus.execute(
      new SendUserPasswordResetLinkBySelfCommand(ctx)
    );
  }
}
