import { GlobalStatus, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { z } from 'zod';
import { User as IUser } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IUserQueryRepository } from '@modules/identity/user/domain/repositories/user.repository';
import { RoleWithCapabilities } from '@common/interfaces';
import { Paginated } from '@common/interfaces/paginated.type';
import { normalizeArray } from '@common/utils/normalize-array';
import {
  AuthUserResponse,
  FindUsersByClinicIdsFilter,
  FindUsersByOrganizationIdsFilter,
} from '@modules/identity/user/domain/contracts/user.contracts';

/** Okuma tarafı: entity hidrate edilmez (veri doğrudan HTTP sınırını geçiyor). */
@Injectable()
export class UserQueryRepository
  extends BaseRepository
  implements IUserQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByIdOrEmail(userIdOrEmail: string): Promise<IUser | null> {
    const { success: isEmail } = z.email().safeParse(userIdOrEmail);
    return this.db.user.findFirst({
      where: isEmail ? { email: userIdOrEmail } : { id: userIdOrEmail },
    });
  }

  async findActiveStaffUserIdsByClinicId(clinicId: string): Promise<string[]> {
    // Bildirim alacak personel: klinikte çalışan (workingClinic) VEYA yöneten
    // (managedClinics) aktif kullanıcılar. Ağır entity yüklemeden sadece id döner.
    const rows = await this.db.user.findMany({
      where: {
        status: GlobalStatus.ACTIVE,
        OR: [{ clinicId }, { managedClinics: { some: { id: clinicId } } }],
      },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }


  checkEmailExists(email: string): Promise<number> {
    return this.db.user.count({ where: { email } });
  }

  async findForAuth(firebaseUid: string): Promise<AuthUserResponse | null> {
    const raw = await this.db.user.findFirst({
      where: { id: firebaseUid, status: GlobalStatus.ACTIVE },
      include: {
        managedClinics: { select: { id: true } },
        ownedOrganizations: { select: { id: true } },
        providerProfile: { select: { id: true } },
        role: {
          include: {
            capabilities: { include: { capability: true } },
          },
        },
      },
    });
    if (!raw) return null;
    return {
      id: raw.id,
      displayName: raw.displayName,
      email: raw.email,
      emailVerified: raw.emailVerified,
      status: raw.status,
      roleId: raw.roleId,
      picture: raw.picture,
      clinicId: raw.clinicId,
      lastLogin: raw.lastLogin,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      managedClinics: raw.managedClinics,
      ownedOrganizations: raw.ownedOrganizations,
      providerProfile: raw.providerProfile,
      role: raw.role as RoleWithCapabilities | null,
    };
  }

  listByOrganizationIds({
    pagination,
    organizationId,
  }: FindUsersByOrganizationIdsFilter): Promise<Paginated<IUser>> {
    const organizationIds = normalizeArray(organizationId);
    return paginate({
      delegate: this.db.user,
      pagination,
      where: {
        workingClinic: { is: { organizationId: { in: organizationIds } } },
        status: { not: GlobalStatus.DELETED },
      },
    });
  }

  listByClinicIds({
    pagination,
    clinicId,
  }: FindUsersByClinicIdsFilter): Promise<Paginated<IUser>> {
    const clinicIds = normalizeArray(clinicId);
    return paginate({
      delegate: this.db.user,
      pagination,
      where: {
        clinicId: { in: clinicIds },
        status: { not: GlobalStatus.DELETED },
      },
    });
  }
}
