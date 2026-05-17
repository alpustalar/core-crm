import { Expose } from 'class-transformer';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';
import { IOrganizationResponse } from '@shared';

export class OrganizationResponseDto implements IOrganizationResponse {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  phone: string | null;

  @Expose()
  email: string | null;

  @Expose()
  status: GlobalStatusType;

  @Expose()
  timezone: string;

  @Expose()
  createdAt: Date;
}
