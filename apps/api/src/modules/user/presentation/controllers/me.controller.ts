import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ChangePasswordUseCase,
  FindOneWithUserIdOrEmailUseCase,
  SendVerificationEmailUseCase,
} from '@modules/user/application/use-cases';
import { AuthGuard } from '@modules/auth/guards';
import { Actor } from '@common/decorators';
import { ActorContext } from '@common/interfaces';
import { CapabilityGuard } from '@modules/auth/guards/capability/capability.guard';
import { UserPaths } from '@modules/user/presentation/controllers/paths';
import { ChangeUserPasswordDto } from '@shared';
import { SendUserPasswordResetLinkBySelfUseCase } from '@modules/user/application/use-cases/commands/send-user-password-reset-link-by-self';

@UseGuards(AuthGuard, CapabilityGuard)
@Controller(UserPaths.ME)
export class MeController {
  constructor(
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly findOneWithUserIdOrEmailUseCase: FindOneWithUserIdOrEmailUseCase,
    private readonly sendUserPasswordResetLinkBySelfUseCase: SendUserPasswordResetLinkBySelfUseCase
  ) {}

  @Version('1')
  @Get('')
  getProfile(@Actor() actor: ActorContext) {
    return this.findOneWithUserIdOrEmailUseCase.execute(actor.userId, actor);
  }

  @Version('1')
  @Post('email-verify')
  sendVerificationEmail(@Actor() actor: ActorContext) {
    return this.sendVerificationEmailUseCase.execute(actor.email);
  }

  @Version('1')
  @Patch('change-password')
  changePassword(
    @Body() dto: ChangeUserPasswordDto,
    @Actor() actor: ActorContext
  ) {
    return this.changePasswordUseCase.execute(dto, actor);
  }

  @Version('1')
  @Post('reset-password')
  sendResetPasswordEmail(@Actor() actor: ActorContext) {
    return this.sendUserPasswordResetLinkBySelfUseCase.execute(actor);
  }
}
