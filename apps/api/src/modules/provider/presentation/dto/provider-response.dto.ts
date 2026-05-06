import { Expose, Type } from 'class-transformer';
import { IProviderResponse } from '@shared/modules/provider';

const providerResMapper = (priority: number, isSelf: boolean) => {
  if (priority >= 100) {
    return ['all'];
  }
  if (priority >= 90) {
    return ['all', 'sensitive'];
  }
};

export class ProviderResponseDto implements IProviderResponse {
  @Expose()
  id: string;

  @Expose()
  title?: string;

  @Expose()
  specialty: string;

  @Expose()
  publicPhone?: string;

  @Expose({ groups: [] })
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
