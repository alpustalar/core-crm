import { Expose, Type } from 'class-transformer';
import { ProviderResponseDto } from '@modules/provider/application/dto/provider-response.dto';
import { UserResponseGroups } from '@modules/user/domain/constants';
import { UserResponse } from '@shared';
import { Role } from '@prisma/client';
import { UserStatusType } from '@input-type-schemas/UserStatusSchema';

export class RelationalDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

const { DATA_OWNER, INTERNAL, MANAGEMENT, ADMIN } = UserResponseGroups;

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
  @Expose({ groups: [DATA_OWNER, MANAGEMENT] })
  email: string;

  @Expose({ groups: [DATA_OWNER, MANAGEMENT] })
  role: Role;

  @Expose({ groups: [DATA_OWNER, MANAGEMENT] })
  emailVerified: boolean;

  @Expose({ groups: [DATA_OWNER, MANAGEMENT] })
  lastLogin: Date;

  // --------------------
  // Management & Operational (Internal Team)
  // --------------------
  @Expose({ groups: [MANAGEMENT, INTERNAL] })
  status: UserStatusType;

  @Expose({ groups: [MANAGEMENT] })
  createdAt: Date;

  @Expose({ groups: [MANAGEMENT] })
  updatedAt: Date;

  @Expose({ groups: [ADMIN] })
  deletedAt?: Date;

  // --------------------
  // Relational Data (Context Specific)
  // --------------------
  @Expose({ groups: [MANAGEMENT] })
  @Type(() => RelationalDto)
  managedClinics?: RelationalDto[];

  @Expose({ groups: [MANAGEMENT] })
  @Type(() => RelationalDto)
  ownedOrganizations?: RelationalDto[];

  @Expose()
  @Type(() => ProviderResponseDto)
  providerProfile?: ProviderResponseDto;
}
