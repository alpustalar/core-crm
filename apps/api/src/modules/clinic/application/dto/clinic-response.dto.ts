import { Expose } from 'class-transformer';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';

export class ClinicResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  phone?: string;

  @Expose()
  email?: string;

  @Expose()
  city?: string;

  @Expose()
  district?: string;

  @Expose()
  status: GlobalStatusType;

  @Expose()
  timezone: string;

  @Expose()
  createdAt: Date;
}
