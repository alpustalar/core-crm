import { Controller, Get, UseGuards, Version } from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { User } from '@shared';
import type { ActorContextResponse } from '@shared/modules/user/interfaces';
import type { QueryResponse } from '@shared/common/response/response.interface';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { FindOneWithIdOrEmailQuery } from '@modules/identity/user/application/queries/find-one-with-id-or-email';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { Serialize } from '@common/decorators/serialize.decorator';
import { UserResponseDto } from '@modules/identity/user/presentation/http/dto';

@UseGuards(AuthGuard, CapabilityGuard)
@Controller('me')
export class MeQueryController {
  constructor(private readonly queryBus: TSQueryBus) {}

  @Version('1')
  @Get('')
  @Serialize<User, UserResponseDto>(UserResponseDto)
  getProfile(@GetContext() ctx: IGetContext) {
    return this.queryBus.execute(
      new FindOneWithIdOrEmailQuery(ctx.actor.userId, ctx)
    );
  }

  /**
   * Aktörün yetki sınırları. Bus'a düşmez: bağlam zaten `AuthGuard` tarafından
   * token'dan çözülüp isteğe iliştirildi, tekrar sorgulamak boşuna gidiş-dönüş
   * olurdu. Frontend bunu girişte bir kez çekip menü/buton görünürlüğünü
   * yansıtmak için kullanır — yetkinin otoritesi guard'lardadır.
   */
  @Version('1')
  @Get('context')
  getContext(
    @GetContext() ctx: IGetContext
  ): QueryResponse<ActorContextResponse> {
    const { actor } = ctx;

    return {
      data: {
        userId: actor.userId,
        email: actor.email,
        capabilities: actor.capabilities,
        rolePriority: actor.rolePriority,
        roleId: actor.roleId,
        clinicId: actor.clinicId,
        organizationId: actor.organizationId,
        managedClinics: actor.managedClinics?.map((clinic) => clinic.id) ?? [],
        ownedOrganizations:
          actor.ownedOrganizations?.map((organization) => organization.id) ??
          [],
        providerId: actor.providerId,
      },
    };
  }
}
