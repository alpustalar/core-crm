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
} from '@modules/user/use-cases';
import { AuthGuard } from '@common/guards';
import { FirebaseService } from '@modules/firebase/firebase.service';
import { Actor, ReqUser } from '@common/decorators';
import { ActorContext } from '@common/interfaces';
import { CapabilityGuard } from '@common/guards/capability/capability.guard';
import { ME_PATH } from '@modules/user/controllers/path';
import { User } from '@prisma/client';
import { ChangeUserPasswordDto } from '@shared/modules';

@UseGuards(AuthGuard, CapabilityGuard)
@Controller(ME_PATH)
export class MeController {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly findOneWithUserIdOrEmailUseCase: FindOneWithUserIdOrEmailUseCase
  ) {}

  @Version('1')
  @Get('')
  getProfile(@Actor() actor: ActorContext) {
    return this.findOneWithUserIdOrEmailUseCase.execute(actor.userId, actor);
  }

  @Version('1')
  @Post('email-verify')
  sendVerificationEmail(@ReqUser() user: User) {
    return this.sendVerificationEmailUseCase.execute(user.email);
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
  sendResetPasswordEmail(@ReqUser() user: User) {
    return this.firebaseService.generatePasswordResetLink(user.email);
  }
}
