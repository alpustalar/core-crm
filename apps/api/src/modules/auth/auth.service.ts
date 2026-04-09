import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { ActorContext } from '@common/interfaces';
import { UserStatus } from '@prisma/client';
import { rolesCreateManyInputs } from '../../../prisma/data';
import { getBearerToken } from '@common/utils';
import { FirebaseService } from '@modules/firebase/firebase.service';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const isDevelopment = process.env.NODE_MODE === 'development';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService
  ) {}

  async validateAndGetContext(idToken: string) {
    const decodedToken = await this.firebaseService.verifyToken(idToken);
    if (!decodedToken) {
      throw new UnauthorizedException('Token geçersiz');
    }

    if (isDevelopment) {
      await this.createAdmin(decodedToken);
    }

    const result = await this.getActorContextOrThrow(decodedToken);

    this.updateLastLogin(result.userId);

    return result;
  }

  getBearerTokenOrThrow(header?: string): string {
    const idToken = getBearerToken(header);
    if (!idToken) {
      throw new UnauthorizedException('Token bulunamadı');
    }
    return idToken;
  }

  async getActorContextOrThrow(decodedToken: DecodedIdToken) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: decodedToken.uid,
        status: UserStatus.ACTIVE,
      },
      include: {
        managedClinics: { select: { id: true, name: true } },
        ownedOrganizations: { select: { id: true, name: true } },
        doctorProfile: { select: { id: true } },
        role: {
          include: {
            capabilities: { include: { capability: true } },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı veya pasif');
    }

    const actor: ActorContext = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId ?? undefined,
      role: user.role ?? undefined,
      clinicId: user.clinicId ?? undefined,
      managedClinics: user.managedClinics || [],
      capabilities:
        user.role?.capabilities.map(
          (rc) => `${rc.capability.module}:${rc.capability.action}`
        ) ?? [],
      rolePriority: user.role?.priority ?? 0,
    };

    return actor;
  }

  updateLastLogin(userId: string): void {
    this.prismaService.user
      .update({
        where: { id: userId },
        data: { lastLogin: new Date() },
      })
      .catch((err) => {
        this.logger.log(`auth service last login update: ${err}`);
      });
  }

  private async createAdmin(decodedToken: DecodedIdToken) {
    const { uid: id, email } = decodedToken;
    if (!email || !ADMIN_EMAIL?.includes(email)) return;

    const role = rolesCreateManyInputs.find((r) => r.priority >= 100);
    const slug = role?.slug ?? 'admin';

    await this.prismaService.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        email,
        displayName: 'System Admin',
        status: UserStatus.ACTIVE,
        role: { connect: { slug } },
      },
    });
  }
}
