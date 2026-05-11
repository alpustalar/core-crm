import { Inject, Injectable } from '@nestjs/common';
import {
  CLINIC_AVAILABILITY_REPO_TOKEN,
  IClinicAvailabilityRepository,
} from '@modules/clinic/domain/repositories/clinic-availability.repository.interface';
import { ClinicAvailability, ClinicException } from '@shared';

export interface ClinicScheduleResult {
  availabilities: ClinicAvailability[];
  exceptions: ClinicException[];
}

interface GetClinicScheduleInput {
  clinicId: string;
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class GetClinicScheduleUseCase {
  constructor(
    @Inject(CLINIC_AVAILABILITY_REPO_TOKEN)
    private readonly clinicAvailabilityRepo: IClinicAvailabilityRepository
  ) {}

  async execute(input: GetClinicScheduleInput): Promise<ClinicScheduleResult> {
    const { clinicId, startDate, endDate } = input;

    const [availabilities, exceptions] = await Promise.all([
      this.clinicAvailabilityRepo.findAllByClinicId(clinicId),
      this.clinicAvailabilityRepo.findExceptionsByDateRange(
        clinicId,
        startDate,
        endDate
      ),
    ]);

    return { availabilities, exceptions };
  }
}
