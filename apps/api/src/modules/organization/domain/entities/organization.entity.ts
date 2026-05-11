import { Expose, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GlobalStatusSchema, Organization } from '@shared';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';

export class OrganizationEntity implements Organization {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsEnum(Object.values(GlobalStatusSchema.enum))
  status: GlobalStatusType;

  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @Expose()
  @IsOptional()
  @IsString()
  phone: string | null;

  @Expose()
  @IsOptional()
  @IsEmail()
  email: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  address: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  city: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  district: string | null;

  @Expose()
  @IsString()
  timezone: string;

  @Expose()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deletedAt: Date | null;

  // --- Domain Logic & Computed Properties ---

  /**
   * Organizasyonun silinip silinmediğini kontrol eder.
   */
  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Organizasyonun operasyonel olarak aktif olup olmadığını kontrol eder.
   */
  get isActive(): boolean {
    return this.status === 'ACTIVE' && !this.isDeleted;
  }

  /**
   * 2026 Disiplini: Karmaşık bir iş kuralı örneği.
   * Organizasyonun iletişim bilgilerinin tam olup olmadığını döner.
   */
  get hasCompleteProfile(): boolean {
    return !!(this.email && this.phone && this.address);
  }
}
