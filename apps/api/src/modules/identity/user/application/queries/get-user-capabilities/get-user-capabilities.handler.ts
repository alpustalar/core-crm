import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserCapabilitiesQuery } from './get-user-capabilities.query';
import { GetUserCapabilitiesResponse } from './get-user-capabilities.response';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IUserCapabilityQueryRepository,
  USER_CAPABILITY_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user-capability/user-capability.query.repository';
import {
  IUserQueryRepository,
  USER_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user/user.query.repository';
import { UserNotFoundException } from '@modules/identity/user/domain/exceptions/user.exceptions';
import { USER_EVENTS } from '@src/domain/constants/events';

/**
 * Bir kullanıcının etkin yetkileri — rolünden gelenler ve kişiye verilenler
 * birlikte, kaynağı işaretli. Yönetim ekranı hangi satırın kaldırılabilir
 * olduğunu `source` alanından okur.
 */
@QueryHandler(GetUserCapabilitiesQuery)
export class GetUserCapabilitiesHandler
  implements IQueryHandler<GetUserCapabilitiesQuery, GetUserCapabilitiesResponse>
{
  constructor(
    @Inject(USER_CAPABILITY_QUERY_REPOSITORY)
    private readonly capabilityRepo: IUserCapabilityQueryRepository,
    @Inject(USER_QUERY_REPOSITORY)
    private readonly userRepo: IUserQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetUserCapabilitiesQuery
  ): Promise<GetUserCapabilitiesResponse> {
    const { targetUserId, ctx } = query;

    const targetUser = await this.userRepo.findByIdOrEmail(targetUserId);
    if (!targetUser) throw new UserNotFoundException();

    // Yetki listesi hassastır: kimin neye eriştiğini gösterir. Yetki kontrolü
    // veriyi çekmeden ÖNCE koşar.
    this.policyFactory
      .user(ctx.actor, ctx.source)
      .evaluator.check(
        (p) =>
          p.isSelf(targetUserId) ||
          p.isTargetInActorsManagedClinic(targetUser.clinicId),
        'Bu kullanıcının yetkilerini görüntüleyemezsiniz.'
      )
      .orThrow(USER_EVENTS.UPDATE);

    const capabilities =
      await this.capabilityRepo.findEffectiveCapabilities(targetUserId);

    return { data: capabilities };
  }
}
