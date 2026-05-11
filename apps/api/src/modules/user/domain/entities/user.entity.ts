import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { User, UserStatusSchema } from '@shared';
import { UserStatusType } from '@input-type-schemas/UserStatusSchema';

export class UserEntity implements User {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  displayName: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsBoolean()
  emailVerified: boolean;

  @Expose()
  @IsEnum(Object.values(UserStatusSchema.enum))
  status: UserStatusType;

  @Expose()
  @IsOptional()
  @IsString()
  picture: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  roleId: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  clinicId: string | null;

  @Expose()
  @IsDate()
  lastLogin: Date;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  deletedAt: Date | null;
}
