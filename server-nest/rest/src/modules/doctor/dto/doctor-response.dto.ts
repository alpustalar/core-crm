import { Expose, Type } from 'class-transformer';
import { DoctorResponse } from '@shared/modules/doctor';
import { DoctorTitleType } from '@shared/generated-zod/inputTypeSchemas/DoctorTitleSchema';
import { DoctorSpecialtyType } from '@shared/generated-zod/inputTypeSchemas/DoctorSpecialtySchema';

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
