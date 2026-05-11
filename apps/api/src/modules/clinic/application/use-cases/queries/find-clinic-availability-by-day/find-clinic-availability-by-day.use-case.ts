import { Inject, Injectable } from '@nestjs/common';
import {
  CLINIC_AVAILABILITY_REPO_TOKEN,
  IClinicAvailabilityRepository,
} from '@modules/clinic/domain/repositories/clinic-availability.repository.interface';
import { QueryResult } from '@shared/common/response/response.interface';

export interface FindClinicAvailabilityByDayOutput {
  isOpen: boolean;
  workingHours: {
    startMinute: number;
    endMinute: number;
  } | null;
  reason: string | null;
}

@Injectable()
export class FindClinicAvailabilityByDayUseCase {
  constructor(
    @Inject(CLINIC_AVAILABILITY_REPO_TOKEN)
    private readonly clinicAvailabilityRepo: IClinicAvailabilityRepository
  ) {}

  async execute(
    clinicId: string,
    date: Date
  ): Promise<QueryResult<FindClinicAvailabilityByDayOutput>> {
    const dayOfWeek = date.getDay();

    const [availability, exception] = await Promise.all([
      this.clinicAvailabilityRepo.findByClinicAndDay(clinicId, dayOfWeek),
      this.clinicAvailabilityRepo.findExceptionByClinicAndDate(clinicId, date),
    ]);

    const isOpen =
      !!availability && !availability.isClosed && !exception?.isClosed;

    return {
      data: {
        isOpen,
        workingHours: isOpen
          ? {
              startMinute: availability.startMinute,
              endMinute: availability.endMinute,
            }
          : null,
        reason: exception?.reason ?? null,
      },
    };
  }
}
