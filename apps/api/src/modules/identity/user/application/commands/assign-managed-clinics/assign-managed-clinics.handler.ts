import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignManagedClinicsCommand } from './assign-managed-clinics.command';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user/user.command.repository';
import {
  ITenantScopeResolver,
  TENANT_SCOPE_RESOLVER,
} from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import { UserNotFoundException } from '@modules/identity/user/domain/exceptions/user.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { USER_EVENTS } from '@src/domain/constants/events';

/**
 * Kullanıcının yönettiği kliniklerin tam listesini belirler.
 *
 * Profil güncellemesinden ayrı bir command olması bilinçlidir: bu bir YETKİ
 * DEVRİDİR. Üç kapı sırayla tutulur:
 * 1. **Kendine devir yok** — aktör kendi kapsamını buradan genişletemez.
 * 2. **Hedefi yönetebiliyor mu** — profil güncellemesiyle aynı eşik.
 * 3. **Verdiği her kliniği yönetiyor mu** — asıl güvenlik sınırı. Ölçüt
 *    "erişim" değil "yönetim": bir kliniğe erişebilmek onu başkasına
 *    dağıtabilmek anlamına gelmez. Doğrulanmasaydı bir klinik yöneticisi,
 *    kullanıcıya başka bir kiracının kliniğini atayıp çapraz kiracı erişimi
 *    açabilirdi.
 *
 * Listedeki tek bir yetkisiz kimlik tüm isteği düşürür — kısmi uygulama,
 * çağıranın hangi devrin geçtiğini bilememesi demektir.
 */
@CommandHandler(AssignManagedClinicsCommand)
export class AssignManagedClinicsHandler implements ICommandHandler<
  AssignManagedClinicsCommand,
  void
> {
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userRepo: IUserCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: AssignManagedClinicsCommand): Promise<void> {
    const { targetUserId, data, ctx } = command.payload;
    const { actor, source } = ctx;

    this.policyFactory
      .user(actor, source)
      .evaluator.check(
        (p) => !p.isSelf(targetUserId),
        'Kendi yönetim kapsamınızı değiştiremezsiniz.'
      )
      .orThrow(USER_EVENTS.MANAGED_CLINICS_ASSIGNED);

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
      .orThrow(USER_EVENTS.MANAGED_CLINICS_ASSIGNED);

    for (const clinicId of data.clinicIds) {
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
        .orThrow(USER_EVENTS.MANAGED_CLINICS_ASSIGNED);
    }

    targetUser.assignManagedClinics({
      clinicIds: data.clinicIds,
      actorId: actor.userId,
    });

    await this.txManager.run(async () => {
      await this.userRepo.replaceManagedClinics(targetUser);
    });
  }
}
