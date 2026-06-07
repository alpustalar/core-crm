import { Expose, Type } from 'class-transformer';
import { IProviderResponse } from '@shared';

export class ProviderResponseDto implements IProviderResponse {
  @Expose()
  id: string;

  @Expose()
  title?: string;

  @Expose()
  specialty: string;

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
