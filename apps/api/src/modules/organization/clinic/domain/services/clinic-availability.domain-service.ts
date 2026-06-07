import { BadRequestException, Injectable } from '@nestjs/common';
import {
  IClinicAvailabilityDomainService,
  ValidateClinicAvailabilityInput,
} from '@modules/organization/clinic/domain/interfaces/clinic-availability.domain-service.interface';
import { DateTimeManager } from '@common/utils/date-time.manager';

@Injectable()
export class ClinicAvailabilityDomainService
  implements IClinicAvailabilityDomainService
{
  validateTimeWithinClinicHoursOrThrow(
    input: ValidateClinicAvailabilityInput
  ): void {
    const { startMinute, endMinute, clinicSchedule } = input;

    // 1. Durum Kontrolü
    if (!clinicSchedule.isOpen || !clinicSchedule.workingHours) {
      throw new BadRequestException(
        clinicSchedule.reason
          ? `Klinik bu tarihte hizmet vermiyor: ${clinicSchedule.reason}`
          : 'Klinik bu tarihte kapalı veya çalışma saati tanımlı değil.'
      );
    }

    const { workingHours } = clinicSchedule;

    // 2. Başlangıç Saati Kontrolü
    if (startMinute < workingHours.startMinute) {
      throw new BadRequestException(
        `İşlem başlangıç saati (${DateTimeManager.minutesToHHMM(startMinute)}) kliniğin açılış saatinden (${DateTimeManager.minutesToHHMM(workingHours.startMinute)}) önce olamaz.`
      );
    }

    // 3. Bitiş Saati Kontrolü
    if (endMinute > workingHours.endMinute) {
      throw new BadRequestException(
        `İşlem bitiş saati (${DateTimeManager.minutesToHHMM(endMinute)}) kliniğin kapanış saatini (${DateTimeManager.minutesToHHMM(workingHours.endMinute)}) aşamaz.`
      );
    }
  }
}
