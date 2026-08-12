import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { HasCapability } from '@common/decorators';
import { CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import { THROTTLE_CONFIG } from '@common/constants';
import { CheckEmailDto, UserSoftDeleteByActorDto } from '@shared';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { UpdateUserByStaffCommand } from '@modules/identity/user/application/commands/update-user-by-staff';
import { SoftDeleteUserByStaffCommand } from '@modules/identity/user/application/commands/soft-delete-user-by-staff';
import { SendVerificationEmailCommand } from '@modules/identity/user/application/commands/send-verification-email';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { UpdateUserByStaffDto } from '@shared/modules/user/dto/commands/update-user-by-staff.dto';

const { USER } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class UserCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  /**
   * Personelin BAŞKA bir kullanıcıya doğrulama e-postası göndermesi. Kendi
   * adresine tekrar göndermek isteyen kullanıcı `me/email-verify` ucunu kullanır;
   * bu uç gövdedeki herhangi bir adrese gönderdiği için yetki ister.
   */
  @Post('email-verification')
  @Version('1')
  @HasCapability(USER.update)
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  @HttpCode(HttpStatus.NO_CONTENT)
  sendEmailVerificationLink(@Body('email') { email }: CheckEmailDto) {
    return this.commandBus.execute(new SendVerificationEmailCommand(email));
  }
  @Patch(':id')
  @Version('1')
  @HasCapability(USER.update)
  updateUserByActor(
    @Param('id') id: string,
    @Body() dto: UpdateUserByStaffDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateUserByStaffCommand({ targetUserId: id, data: dto, ctx })
    );
  }

  @Patch('soft-delete')
  @Version('1')
  @HasCapability(USER.delete)
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  softDelete(
    @Body() dto: UserSoftDeleteByActorDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new SoftDeleteUserByStaffCommand(dto, ctx));
  }
}
