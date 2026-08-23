import { AttachClinicToOrganizationOwnersHandler } from './attach-clinic-to-organization-owners.handler';
import { AttachClinicToOrganizationOwnersCommand } from './attach-clinic-to-organization-owners.command';

/**
 * Sahiplik organizasyon seviyesinde durur, `managedClinics` açık bir atamadır;
 * yeni klinik oraya girmezse sahip kendi açtığı klinikte klinik-seviye
 * listelerin ve atama ekranlarının dışında kalır.
 */
describe('AttachClinicToOrganizationOwnersHandler', () => {
  const ORG = 'org-1';
  const CLINIC = 'clinic-1';

  const build = (attachedCount = 1) => {
    const userRepo = {
      addManagedClinicToOrganizationOwners: jest
        .fn()
        .mockResolvedValue({ attachedCount }),
    };

    return {
      userRepo,
      handler: new AttachClinicToOrganizationOwnersHandler(userRepo as never),
    };
  };

  it('organizasyonun sahiplerini kliniğe bağlar', async () => {
    const { handler, userRepo } = build();

    await handler.execute(
      new AttachClinicToOrganizationOwnersCommand(ORG, CLINIC)
    );

    expect(userRepo.addManagedClinicToOrganizationOwners).toHaveBeenCalledWith(
      ORG,
      CLINIC
    );
  });

  it('sahibi olmayan organizasyonda sessizce geçer — hata değil', async () => {
    // Sistem yöneticisinin açtığı, henüz sahibi atanmamış kiracı olağan bir durum.
    const { handler } = build(0);

    await expect(
      handler.execute(new AttachClinicToOrganizationOwnersCommand(ORG, CLINIC))
    ).resolves.toBeUndefined();
  });
});
