interface ClinicWorkingHours {
  startMinute: number;
  endMinute: number;
}

interface ClinicSchedule {
  isOpen: boolean;
  workingHours: ClinicWorkingHours | null;
  reason?: string | null;
}

export interface ValidateClinicAvailabilityInput {
  startMinute: number;
  endMinute: number;
  clinicSchedule: ClinicSchedule;
}

export const CLINIC_AVAILABILITY_DOMAIN_SERVICE_TOKEN = Symbol(
  'IClinicAvailabilityDomainService'
);

export interface IClinicAvailabilityDomainService {
  validateTimeWithinClinicHoursOrThrow(
    input: ValidateClinicAvailabilityInput
  ): void;
}
