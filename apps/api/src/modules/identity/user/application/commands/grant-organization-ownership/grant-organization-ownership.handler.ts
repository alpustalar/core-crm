import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GrantOrganizationOwnershipCommand } from './grant-organization-ownership.command';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user/user.command.repository';
import { UserNotFoundException } from '@modules/identity/user/domain/exceptions/user.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { USER_EVENTS } from '@src/domain/constants/events';

/**
 * Organizasyon sahipliğini devreder — sistemdeki en geniş kapsam, çünkü sahip
 * organizasyonun tüm kliniklerini kapsar.
 *
 * Devir ölçütü ÜYELİK değil SAHİPLİKTİR: aynı organizasyonda çalışıyor olmak
 * onu dağıtma hakkı vermez, yoksa herhangi bir personel kendi organizasyonunu
 * bir başkasına verebilirdi.
 */
@CommandHandler(GrantOrganizationOwnershipCommand)
export class GrantOrganizationOwnershipHandler implements ICommandHandler<
  GrantOrganizationOwnershipCommand,
  void
> {
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userRepo: IUserCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: GrantOrganizationOwnershipCommand): Promise<void> {
    const { targetUserId, data, ctx } = command.payload;
    const { actor, source } = ctx;

    this.policyFactory
      .user(actor, source)
      .evaluator.check(
        (p) => !p.isSelf(targetUserId),
        'Kendi sahipliğinizi değiştiremezsiniz.'
      )
      .orThrow(USER_EVENTS.ORGANIZATION_OWNERSHIP_GRANTED);

    const targetUser = await this.userRepo.findById(targetUserId);
    if (!targetUser) throw new UserNotFoundException();

    this.policyFactory
      .user(actor, source)
      .evaluator.check(
        (p) =>
          p.actorCanUpdateTargetUser(
            targetUser.role?.priority,
            targetUser.clinicId?.value
          ),
        'Bu kullanıcının kapsamını yönetemezsiniz.'
      )
      .orThrow(USER_EVENTS.ORGANIZATION_OWNERSHIP_GRANTED);

    for (const organizationId of data.organizationIds) {
      this.policyFactory
        .organization(actor, source)
        .evaluator.check(
          (p) => p.actorCanManageTargetOrganization(organizationId),
          'Sahibi olmadığınız bir organizasyonu atayamazsınız.'
        )
        .orThrow(USER_EVENTS.ORGANIZATION_OWNERSHIP_GRANTED);
    }

    targetUser.grantOrganizationOwnership({
      organizationIds: data.organizationIds,
      actorId: actor.userId,
    });

    await this.txManager.run(async () => {
      await this.userRepo.replaceOwnedOrganizations(targetUser);
    });
  }
}
