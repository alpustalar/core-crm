import { Expose, Type } from 'class-transformer';
import { DoctorResponse } from '@shared/modules/doctor/index';
import { DoctorTitleType } from '@input-type-schemas/DoctorTitleSchema';
import { DoctorSpecialtyType } from '@input-type-schemas/DoctorSpecialtySchema';

export class DoctorResponseDto implements DoctorResponse {
  @Expose()
  id: string;

  @Expose()
  title?: DoctorTitleType;

  @Expose()
  specialty: DoctorSpecialtyType;

  @Expose()
  publicPhone?: string;

  @Expose()
  publicEmail?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  clinicId: string;

  @Expose()
  userId: string;
}
