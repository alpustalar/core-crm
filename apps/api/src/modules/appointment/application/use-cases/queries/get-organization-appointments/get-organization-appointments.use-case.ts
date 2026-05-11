import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { ActorContext } from '@common/interfaces';
import { Pagination } from '@shared';

interface GetOrganizationAppointmentsInput {
  pagination: Pagination;
  organizationId: string;
  clinicId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class GetOrganizationAppointmentsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository
  ) {}

  async execute(input: GetOrganizationAppointmentsInput, actor: ActorContext) {
    if (!actor.ownedOrganizations) {
      throw new ForbiddenException('Bu işlem için yetkiniz yok');
    }

    const findOrganization = actor.ownedOrganizations.find(
      (organization) => organization.id === input.organizationId
    );

    if (!findOrganization) {
      throw new ForbiddenException('Bu işlem için yetkiniz yok');
    }

    const { organizationId, ...rest } = input;

    return this.appointmentRepo.findByOrganizationId({
      organizationId,
      ...rest,
    });
  }
}
