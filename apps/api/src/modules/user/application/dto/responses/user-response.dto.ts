import { Expose, Type } from 'class-transformer';
import { DoctorResponseDto } from '@modules/doctor/application/dto/doctor-response.dto';
import { UserResponseGroups } from '@modules/user/constants';
import { UserResponse } from '@shared';
import { Role } from '@prisma/client';
import { UserStatusType } from '@input-type-schemas/UserStatusSchema';

export class RelationalDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

const {
  DATA_OWNER,
  AUDIT,
  INTERNAL,
  MANAGEMENT_BASIC,
  MANAGEMENT_FULL,
  SENSITIVE,
} = UserResponseGroups;

export class UserResponseDto implements UserResponse {
  // --------------------
  // Identity & Core (Public)
  // --------------------
  @Expose()
  id: string;

  @Expose()
  displayName: string;

  @Expose()
  picture?: string;

  @Expose()
  clinicId?: string;

  // --------------------
  // Ownership & Privacy (Self + Management)
  // --------------------
  @Expose({ groups: [DATA_OWNER, MANAGEMENT_BASIC] })
  email: string;

  @Expose({ groups: [DATA_OWNER, MANAGEMENT_BASIC] })
  role: Role;

  @Expose({ groups: [DATA_OWNER, MANAGEMENT_FULL] })
  emailVerified: boolean;

  @Expose({ groups: [DATA_OWNER, MANAGEMENT_FULL] })
  lastLogin: Date;

  // --------------------
  // Management & Operational (Internal Team)
  // --------------------
  @Expose({ groups: [MANAGEMENT_BASIC, INTERNAL] })
  status: UserStatusType;

  @Expose({ groups: [MANAGEMENT_BASIC] })
  createdAt: Date;

  @Expose({ groups: [MANAGEMENT_FULL] })
  updatedAt: Date;

  @Expose({ groups: [SENSITIVE, AUDIT] })
  deletedAt?: Date;

  // --------------------
  // Relational Data (Context Specific)
  // --------------------
  @Expose({ groups: [MANAGEMENT_BASIC] })
  @Type(() => RelationalDto)
  managedClinics?: RelationalDto[];

  @Expose({ groups: [MANAGEMENT_FULL] })
  @Type(() => RelationalDto)
  ownedOrganizations?: RelationalDto[];

  @Expose()
  @Type(() => DoctorResponseDto)
  doctorProfile?: DoctorResponseDto;
}
