import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { ActorContext } from '@common/interfaces';
import { LogSource } from '@src/domain/constants/log-action.constant';

import { getBearerToken } from '@common/utils';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@modules/firebase/domain/interfaces/firebase.service.interface';
import { rolesCreateManyInputs } from '@src/infrastructure/persistence/prisma/data/modules';

import { GlobalStatusSchema } from '@input-type-schemas/GlobalStatusSchema';
import { FindUserForAuthQuery } from '@modules/user/application/queries/find-user-for-auth/find-user-for-auth.query';
import { UpdateLastLoginCommand } from '@modules/user/application/commands/update-last-login/update-last-login.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const isDevelopment = process.env.NODE_MODE === 'development';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    // TODO: prod'ta prisma service kaldır
    private readonly prismaService: PrismaService,
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus,
    @Inject(FIREBASE_SERVICE)
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
    const { data } = await this.queryBus.execute(
      new FindUserForAuthQuery(decodedToken.uid)
    );

    const user = data;

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı veya pasif');
    }

    const actor: ActorContext = {
      userId: user.id,
      email: user.email,
      capabilities: user.role
        ? user.role.capabilities.map(
            (roleCapability) =>
              `${roleCapability.capability.module}:${roleCapability.capability.action}`
          )
        : [],
      rolePriority: user.role?.priority ?? 0,
      source: LogSource.SYSTEM,
      managedClinics: user.managedClinics ?? [],
      ownedOrganizations: user.ownedOrganizations ?? [],
      roleId: user.roleId ?? undefined,
      role: user.role ?? undefined,
      clinicId: user.clinicId ?? undefined,
    };

    return actor;
  }

  updateLastLogin(userId: string): void {
    this.commandBus.execute(new UpdateLastLoginCommand(userId)).catch((e) => {
      this.logger.error(`auth service last login update: ${e}`);
    });
  }

  // TODO: prod'ta kaldır
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
