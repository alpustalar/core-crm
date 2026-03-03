import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { FirebaseService } from '@modules/firebase/firebase.service';
import { UserStatus } from '@prisma/client';
import { DecodedIdToken } from 'firebase-admin/auth';
import { ActorContext, IRequestWithUser } from '@common/interfaces';
import { asyncHandler, getBearerToken } from '../../utils';
import { rolesCreateManyInputs } from '../../../../prisma/data';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const isDevelopment = process.env.NODE_MODE === 'development';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private firebaseService: FirebaseService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithUser>();
    const idToken = getBearerToken(request.headers.authorization);

    if (!idToken) {
      throw new UnauthorizedException('Token bulunamadı');
    }

    const [decodedToken, verifyError] = await asyncHandler(
      this.firebaseService.verifyToken(idToken),
    );

    if (verifyError || !decodedToken?.email) {
      throw new UnauthorizedException('Token geçersiz');
    }

    await this.development(decodedToken);

    const { user, actor } = await this.loadUser(decodedToken);

    if (!user) {
      throw new InternalServerErrorException('Kullanıcı yüklenemedi');
    }

    // ✅ Async lastLogin update (fire & forget)
    this.updateLastLogin(user.id);

    request.user = user;
    request.actor = actor;

    return true;
  }

  private async development(user: DecodedIdToken) {
    if (isDevelopment) {
      await this.createAdmin(user);
    }
  }

  /**
   * User ve ActorContext yükle
   */
  private async loadUser(decodedToken: DecodedIdToken) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: decodedToken.uid,
        status: UserStatus.ACTIVE,
      },
      include: {
        managedClinics: {
          select: { id: true, name: true },
        },
        ownedOrganizations: {
          select: { id: true, name: true },
        },
        doctorProfile: {
          select: { id: true },
        },
        role: {
          include: {
            capabilities: {
              include: {
                capability: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Erişim yetkiniz yok');
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
          (rc) => `${rc.capability.module}:${rc.capability.action}`,
        ) ?? [],

      rolePriority: user.role?.priority ?? 0,
    };

    return { user, actor };
  }

  private updateLastLogin(userId: string): void {
    this.prismaService.user
      .update({
        where: { id: userId },
        data: { lastLogin: new Date() },
      })
      .catch(() => {});
  }

  private async createAdmin(decodedToken: DecodedIdToken) {
    const { uid: id, email } = decodedToken;

    if (!ADMIN_EMAIL?.includes(email!)) return;
    const role = rolesCreateManyInputs.find(
      (r) => r.isSystemRole ?? r.slug === 'admin',
    );
    const slug = role?.slug ?? 'admin';

    await this.prismaService.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        email: email!,
        displayName: 'System Admin',
        status: UserStatus.ACTIVE,
        role: {
          connect: { slug },
        },
      },
    });
  }
}
