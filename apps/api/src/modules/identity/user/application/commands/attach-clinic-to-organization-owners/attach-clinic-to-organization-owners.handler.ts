import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AttachClinicToOrganizationOwnersCommand } from './attach-clinic-to-organization-owners.command';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user/user.command.repository';

/**
 * Sahiplik organizasyon seviyesinde bir gerçektir; `managedClinics` ise açık bir
 * atamadır. Yeni klinik bu atamaya girmezse sahip, kendi organizasyonuna açtığı
 * klinikte klinik-seviye kontrollerin dışında kalır — kapsam kontrolü onu
 * organizasyon sahipliğinden geçirir ama klinik listeleri, atama ekranları ve
 * "yönettiğim klinikler" filtreleri onu görmez.
 */
@CommandHandler(AttachClinicToOrganizationOwnersCommand)
export class AttachClinicToOrganizationOwnersHandler implements ICommandHandler<
  AttachClinicToOrganizationOwnersCommand,
  void
> {
  private readonly logger = new Logger(
    AttachClinicToOrganizationOwnersHandler.name
  );

  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userRepo: IUserCommandRepository
  ) {}

  async execute(
    command: AttachClinicToOrganizationOwnersCommand
  ): Promise<void> {
    const { organizationId, clinicId } = command;

    const { attachedCount } =
      await this.userRepo.addManagedClinicToOrganizationOwners(
        organizationId,
        clinicId
      );

    if (attachedCount === 0) {
      // Sahipsiz organizasyon (ör. sistem yöneticisinin açtığı, henüz sahibi
      // atanmamış kiracı) olağan bir durumdur; bağ sahip atandığında kurulur.
      this.logger.debug(
        `Kliniğe eklenecek organizasyon sahibi bulunamadı (clinic=${clinicId}).`
      );
    }
  }
}
