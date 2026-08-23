import { ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateUserByStaffHandler } from './update-user-by-staff.handler';
import { UpdateUserByStaffCommand } from './update-user-by-staff.command';
import { PolicyFactory } from '@modules/platform/policy/staff/application/policy-factory';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { Priority } from '@src/domain/value-objects/priority.vo';
import { ActorContext } from '@common/interfaces';
import type { IGetContext } from '@common/decorators/get-context.decorator';

/**
 * `managedClinicIds` / `ownedOrganizationIds` uzun süre DTO'da vardı ama entity
 * onları okumuyor, `update()` de yazmıyordu: alanlar sessizce düşüyordu. Çalışır
 * hale gelmeleri aynı zamanda bir YETKİ DEVRİ yüzeyi açar — bir klinik yöneticisi
 * kullanıcıya başka bir kiracının kliniğini atayabilirdi. Testler hem yazmanın
 * gerçekleştiğini hem devrin sınırlandığını sabitler.
 */
describe('UpdateUserByStaffHandler — kapsam atamaları', () => {
  const OWN_CLINIC = 'clinic-own';
  const FOREIGN_CLINIC = 'clinic-foreign';
  const ORG = 'org-1';
  const FOREIGN_ORG = 'org-2';
  const TARGET = 'user-target';

  const manager: ActorContext = {
    userId: 'user-manager',
    email: 'manager@clinic.com',
    source: LogSource.WEB,
    capabilities: [],
    rolePriority: 80,
    managedClinics: [{ id: OWN_CLINIC }],
    ownedOrganizations: [],
    clinicId: OWN_CLINIC,
    organizationId: ORG,
  };

  const build = () => {
    const targetUser = {
      role: { priority: Priority.fromTrusted(10) },
      clinicId: { value: OWN_CLINIC },
      updateDetails: jest.fn(),
    };

    const userRepo = {
      findById: jest.fn().mockResolvedValue(targetUser),
      update: jest.fn().mockResolvedValue(targetUser),
    };

    const handler = new UpdateUserByStaffHandler(
      userRepo as never,
      new PolicyFactory(new EventEmitter2()),
      {
        resolve: jest.fn(({ clinicId }: { clinicId: string }) =>
          Promise.resolve(clinicId === OWN_CLINIC ? ORG : FOREIGN_ORG)
        ),
      } as never,
      { run: jest.fn((cb: () => unknown) => cb()) } as never
    );

    const ctx: IGetContext = {
      actor: manager,
      source: ExecutionSources.USER_ACTION,
    };

    return { handler, userRepo, targetUser, ctx };
  };

  const run = (
    data: Record<string, unknown>,
    deps = build()
  ): [Promise<unknown>, ReturnType<typeof build>] => [
    deps.handler.execute(
      new UpdateUserByStaffCommand({
        targetUserId: TARGET,
        data: data as never,
        ctx: deps.ctx,
      })
    ),
    deps,
  ];

  it('yönetilen klinik atanabilir ve entity’ye geçer', async () => {
    const deps = build();
    const [promise] = run({ managedClinicIds: [OWN_CLINIC] }, deps);

    await promise;

    expect(deps.targetUser.updateDetails).toHaveBeenCalledWith(
      { managedClinicIds: [OWN_CLINIC] },
      manager.userId
    );
    expect(deps.userRepo.update).toHaveBeenCalled();
  });

  it('yönetilmeyen klinik atanamaz — kayıt yazılmaz', async () => {
    const deps = build();
    const [promise] = run({ managedClinicIds: [FOREIGN_CLINIC] }, deps);

    await expect(promise).rejects.toThrow(ForbiddenException);
    expect(deps.userRepo.update).not.toHaveBeenCalled();
    expect(deps.targetUser.updateDetails).not.toHaveBeenCalled();
  });

  it('listedeki tek bir yabancı klinik tüm isteği düşürür', async () => {
    const deps = build();
    const [promise] = run(
      { managedClinicIds: [OWN_CLINIC, FOREIGN_CLINIC] },
      deps
    );

    await expect(promise).rejects.toThrow(ForbiddenException);
    expect(deps.userRepo.update).not.toHaveBeenCalled();
  });

  it('sahibi olunmayan organizasyon atanamaz', async () => {
    const deps = build();
    const [promise] = run({ ownedOrganizationIds: [ORG] }, deps);

    // Aktör bu organizasyonun ÜYESİ ama SAHİBİ değil; devir için sahiplik gerekir.
    await expect(promise).rejects.toThrow(ForbiddenException);
  });

  it('sahip olunan organizasyon atanabilir', async () => {
    const deps = build();
    deps.ctx.actor.ownedOrganizations = [{ id: ORG }];

    const [promise] = run({ ownedOrganizationIds: [ORG] }, deps);

    await promise;
    expect(deps.userRepo.update).toHaveBeenCalled();
  });

  it('boş dizi atamayı kaldırmak demektir ve doğrulama gerektirmez', async () => {
    const deps = build();
    const [promise] = run({ managedClinicIds: [] }, deps);

    await promise;
    expect(deps.targetUser.updateDetails).toHaveBeenCalledWith(
      { managedClinicIds: [] },
      manager.userId
    );
  });
});
