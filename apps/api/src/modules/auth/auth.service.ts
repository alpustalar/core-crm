import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { ActorContext } from '@common/interfaces';

import { getBearerToken } from '@common/utils';
import {
  FIREBASE_SERVICE_TOKEN,
  IFirebaseService,
} from '@modules/firebase/domain/interfaces/firebase.service.interface';
import { rolesCreateManyInputs } from '@src/infrastructure/persistence/prisma/data/modules';
import {
  IUserModuleApi,
  USER_MODULE_API_TOKEN,
} from '@modules/user/domain/interfaces/user.module.api.interface';
import { GlobalStatusSchema } from '@input-type-schemas/GlobalStatusSchema';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const isDevelopment = process.env.NODE_MODE === 'development';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(USER_MODULE_API_TOKEN)
    private readonly userModuleApi: IUserModuleApi,
    @Inject(FIREBASE_SERVICE_TOKEN)
    private readonly firebaseService: IFirebaseService
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
    const user = await this.userModuleApi.findUserForAuth(decodedToken.uid);

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı veya pasif');
    }

    const actor: ActorContext = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId ?? undefined,
      role: user?.role ?? undefined,
      clinicId: user.clinicId ?? undefined,
      managedClinics: user.managedClinics || [],
      capabilities: user?.role
        ? user?.role.capabilities.map(
            (roleCapability) =>
              `${roleCapability.capability.module}:${roleCapability.capability.action}`
          )
        : [],

      rolePriority: user?.role?.priority ?? 0,
    };

    return actor;
  }

  updateLastLogin(userId: string): void {
    this.userModuleApi.updateLastLogin(userId).catch((e) => {
      this.logger.error(`auth service last login update: ${e}`);
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
        status: GlobalStatusSchema.enum.ACTIVE,
        role: { connect: { slug } },
      },
    });
  }
}
