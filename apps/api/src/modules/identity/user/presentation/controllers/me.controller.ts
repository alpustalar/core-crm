import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { AuthService } from '@modules/identity/auth/auth/auth.service';
import { CapabilityGuard } from '@modules/identity/auth/auth/guards/capability/capability.guard';
import { THROTTLE_CONFIG } from '@common/constants';
import { ChangeUserPasswordDto, User } from '@shared';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { getBearerToken } from '@common/utils';
import { ChangePasswordCommand } from '@modules/identity/user/application/commands/change-password';
import { SendVerificationEmailCommand } from '@modules/identity/user/application/commands/send-verification-email';
import { SendUserPasswordResetLinkBySelfCommand } from '@modules/identity/user/application/commands/send-user-password-reset-link-by-self';
import { FindOneWithIdOrEmailQuery } from '@modules/identity/user/application/queries/find-one-with-id-or-email';

import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { Serialize } from '@common/decorators/serialize.decorator';
import { UserResponseDto } from '@modules/identity/user/presentation/dto';

@UseGuards(AuthGuard, CapabilityGuard)
@Controller('me')
export class MeController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus,
    private readonly authService: AuthService
  ) {}

  @Version('1')
  @Get('')
  @Serialize<User, UserResponseDto>(UserResponseDto)
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

  @Version('1')
  @Post('logout')
  logout(
    @Headers('authorization') auth: string,
    @GetContext() ctx: IGetContext
  ) {
    const token = getBearerToken(auth) ?? '';
    return this.authService.logout(token, ctx.actor.userId);
  }
}
