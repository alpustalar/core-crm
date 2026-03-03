import { Expose } from 'class-transformer';

export class OrganizationResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  phone?: string;

  @Expose()
  email?: string;

  @Expose()
  status: string;

  @Expose()
  timezone: string;

  @Expose()
  createdAt: Date;
}
