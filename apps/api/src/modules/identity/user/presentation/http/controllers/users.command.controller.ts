import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
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
import { GrantUserCapabilityDto } from '@shared/modules/user/dto/commands/grant-user-capability.dto';
import { GrantUserCapabilityCommand } from '@modules/identity/user/application/commands/grant-user-capability/grant-user-capability.command';
import { RevokeUserCapabilityCommand } from '@modules/identity/user/application/commands/revoke-user-capability/revoke-user-capability.command';
import { AssignManagedClinicsDto } from '@shared/modules/user/dto/commands/assign-managed-clinics.dto';
import { GrantOrganizationOwnershipDto } from '@shared/modules/user/dto/commands/grant-organization-ownership.dto';
import { AssignManagedClinicsCommand } from '@modules/identity/user/application/commands/assign-managed-clinics';
import { GrantOrganizationOwnershipCommand } from '@modules/identity/user/application/commands/grant-organization-ownership';

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
  sendEmailVerificationLink(@Body() { email }: CheckEmailDto) {
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

  /**
   * Kullanıcının yönettiği kliniklerin TAM listesini belirler.
   *
   * Profil ucundan (`PATCH :id`) ayrı durur: bu bir yetki devridir ve aynı
   * gövdede taşınsaydı telefon güncelleyen bir istek, eksik gönderilen bir dizi
   * yüzünden kullanıcının tüm kapsamını silebilirdi. `PUT`, gövdenin tam liste
   * olduğunu (kısmi değil) söyler.
   *
   * `USER.update` yetkisi yalnız kapıdır; asıl sınır handler'daki devir
   * kontrolüdür — aktör yalnız kendi yönettiği kliniği atayabilir.
   */
  @Put(':id/managed-clinics')
  @Version('1')
  @HasCapability(USER.update)
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  @HttpCode(HttpStatus.NO_CONTENT)
  assignManagedClinics(
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Body() dto: AssignManagedClinicsDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new AssignManagedClinicsCommand({ targetUserId, data: dto, ctx })
    );
  }

  /**
   * Kullanıcının sahibi olduğu organizasyonların TAM listesini belirler.
   * Sistemdeki en geniş kapsam; devir için aktörün o organizasyonun SAHİBİ
   * olması gerekir (üyelik yetmez).
   */
  @Put(':id/owned-organizations')
  @Version('1')
  @HasCapability(USER.update)
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  @HttpCode(HttpStatus.NO_CONTENT)
  grantOrganizationOwnership(
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Body() dto: GrantOrganizationOwnershipDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new GrantOrganizationOwnershipCommand({ targetUserId, data: dto, ctx })
    );
  }

  /**
   * Personele rolünün üstüne tek bir yetki verir. Platform yetkileri ve aktörün
   * kendisinde olmayan yetkiler handler'da reddedilir.
   */
  @Post(':id/capabilities')
  @Version('1')
  @HasCapability(USER.update)
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  @HttpCode(HttpStatus.NO_CONTENT)
  grantCapability(
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Body() dto: GrantUserCapabilityDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new GrantUserCapabilityCommand({ targetUserId, data: dto, ctx })
    );
  }

  /** Yalnız kişiye özel verilmiş yetkiyi kaldırır; rolden geleni değil. */
  @Delete(':id/capabilities/:capability')
  @Version('1')
  @HasCapability(USER.update)
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeCapability(
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Param('capability') capability: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RevokeUserCapabilityCommand({ targetUserId, capability, ctx })
    );
  }
}
