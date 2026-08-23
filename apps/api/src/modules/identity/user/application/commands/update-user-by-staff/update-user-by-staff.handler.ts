import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { UpdateUserByStaffResponse } from '@modules/identity/user/application/commands/update-user-by-staff/update-user-by-staff.response';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { USER_EVENTS } from '@src/domain/constants/events';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { UpdateUserByStaffCommand } from './update-user-by-staff.command';
import type { IGetContext } from '@common/decorators/get-context.decorator';
import { UserNotFoundException } from '@modules/identity/user/domain/exceptions/user.exceptions';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user/user.command.repository';
import {
  ITenantScopeResolver,
  TENANT_SCOPE_RESOLVER,
} from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';

@CommandHandler(UpdateUserByStaffCommand)
export class UpdateUserByStaffHandler implements ICommandHandler<
  UpdateUserByStaffCommand,
  UpdateUserByStaffResponse
> {
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userRepo: IUserCommandRepository,
    @Inject(POLICY_FACTORY)
    protected readonly policyFactory: IPolicyFactory,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: UpdateUserByStaffCommand
  ): Promise<UpdateUserByStaffResponse> {
    const { targetUserId, data, ctx } = command.payload;

    const hasOwnedOrgs = !!data.ownedOrganizationIds?.length;
    const hasManagedClinics = !!data.managedClinicIds?.length;

    this.policyFactory
      .user(ctx.actor, ctx.source)
      .evaluator.bypassIf(!(!!data.roleId || hasOwnedOrgs || hasManagedClinics))
      .check(
        (p) => p.isSelf(targetUserId),
        'Kendi yetkilerinizi buradan değiştiremezsiniz.'
      );

    const targetUser = await this.userRepo.findById(targetUserId);

    if (!targetUser) throw new UserNotFoundException();

    this.policyFactory
      .user(ctx.actor, ctx.source)
      .evaluator.check(
        (p) =>
          p.actorCanUpdateTargetUser(
            targetUser.role?.priority,
            targetUser.clinicId?.value
          ),
        'Bu işlem için yeterli yetkiye sahip değilsiniz.'
      )
      .orThrow(USER_EVENTS.UPDATE);

    await this.assertActorCanGrantScopes(data, ctx);

    targetUser.updateDetails(data, ctx.actor.userId);

    await this.txManager.run(async () => {
      await this.userRepo.update(targetUser);
    });
  }

  /**
   * Kapsam atamaları yetki DEVRİDİR: aktör, kendi erişemediği bir kliniği ya da
   * sahibi olmadığı bir organizasyonu başkasına veremez. Doğrulama olmadan bir
   * klinik yöneticisi, kullanıcıya başka bir kiracının kliniğini atayarak çapraz
   * kiracı erişimi açabilirdi.
   *
   * Ölçüt "erişim" değil "yönetim": bir kliniğe erişebilmek onu dağıtabilmek
   * anlamına gelmez. Sistem yöneticisi evaluator tarafından zaten muaf tutulur.
   */
  private async assertActorCanGrantScopes(
    data: { managedClinicIds?: string[]; ownedOrganizationIds?: string[] },
    ctx: IGetContext
  ): Promise<void> {
    const { actor, source } = ctx;

    for (const clinicId of data.managedClinicIds ?? []) {
      const organizationId = await this.tenantScopeResolver.resolve({
        clinicId,
      });

      this.policyFactory
        .clinic(actor, source)
        .evaluator.check(
          (p) =>
            p.actorCanManageClinicOrOwnsOrganization(clinicId, organizationId),
          'Yönetmediğiniz bir kliniği atayamazsınız.'
        )
        .orThrow(USER_EVENTS.UPDATE);
    }

    for (const organizationId of data.ownedOrganizationIds ?? []) {
      this.policyFactory
        .organization(actor, source)
        .evaluator.check(
          (p) => p.actorCanManageTargetOrganization(organizationId),
          'Sahibi olmadığınız bir organizasyonu atayamazsınız.'
        )
        .orThrow(USER_EVENTS.UPDATE);
    }
  }
}
