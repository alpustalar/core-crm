import { ActorContext } from '@common/interfaces';
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { DecodedIdToken } from 'firebase-admin/auth';

import { getBearerToken } from '@common/utils';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@src/infrastructure/firebase/firebase.service.interface';
import { rolesCreateManyInputs } from '@src/infrastructure/persistence/prisma/data/modules';

import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GlobalStatusSchema } from '@input-type-schemas/GlobalStatusSchema';
import { UpdateLastLoginCommand } from '@modules/identity/user/application/commands/update-last-login/update-last-login.command';
import { FindUserForAuthQuery } from '@modules/identity/user/application/queries/find-user-for-auth/find-user-for-auth.query';
import { AuthCacheService } from '@modules/identity/auth/auth/infrastructure/cache/auth-cache.service';
import { Priority } from '@src/domain/value-objects/priority.vo';

// TODO: PROD'TA KALDIR
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const isDevelopment = process.env.MODE === 'DEVELOPMENT';
//

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    // TODO: prod'ta prisma service kaldır
    private readonly prismaService: PrismaService,
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus,
    private readonly cacheService: AuthCacheService,
    @Inject(FIREBASE_SERVICE)
    private readonly firebaseService: IFirebaseService
  ) {}

  async validateAndGetContext(idToken: string) {
    const blocked = await this.cacheService.token.isBlocked(idToken);
    if (blocked) throw new UnauthorizedException('Token geçersiz');

    const decodedToken = await this.firebaseService.verifyToken(idToken);
    if (!decodedToken) throw new UnauthorizedException('Token geçersiz');

    // TODO: prod'ta bu satırı kaldır
    if (isDevelopment) await this.createAdmin(decodedToken);

    const cached = await this.cacheService.actorContext.get(decodedToken.uid);
    if (cached) {
      this.updateLastLogin(cached.userId);
      return cached;
    }

    const result = await this.getActorContextOrThrow(decodedToken);
    await this.cacheService.actorContext.set(decodedToken.uid, result);

    this.updateLastLogin(result.userId);
    return result;
  }

  async logout(rawToken: string, userId: string): Promise<void> {
    const parts = rawToken.split('.');
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(
          Buffer.from(parts[1], 'base64url').toString()
        ) as { exp?: number };
        const ttl = (payload.exp ?? 0) - Math.floor(Date.now() / 1000);
        if (ttl > 0) await this.cacheService.token.block(rawToken, ttl);
      } catch {
        // token decode edilemedi, sadece cache temizle
      }
    }
    await this.cacheService.actorContext.del(userId);
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
      providerId: user.providerProfile?.id ?? undefined,
    };

    return actor;
  }

  updateLastLogin(userId: string): void {
    this.commandBus.execute(new UpdateLastLoginCommand(userId)).catch((e) => {
      this.logger.error(`auth service last login update: ${e}`);
    });
  }

  // TODO: prod'ta create admin kaldır
  private async createAdmin(decodedToken: DecodedIdToken) {
    const { uid: id, email } = decodedToken;
    if (!email || !ADMIN_EMAIL?.includes(email)) return;

    const systemAdminRole = rolesCreateManyInputs.find((r) => {
      const priority = Priority.fromTrusted(r.priority);
      return priority.validate.isAdmin.value;
    });

    if (!systemAdminRole) {
      throw new NotFoundException(
        'Sistem başlatılamadı: Bellekte geçerli bir Admin rol tanımı bulunamadı.'
      );
    }

    await this.prismaService.user.upsert({
      where: { id },
      update: { status: GlobalStatusSchema.enum.ACTIVE },
      create: {
        id,
        email,
        displayName: 'System Admin',
        status: GlobalStatusSchema.enum.ACTIVE,
        role: { connect: { slug: systemAdminRole.slug } },
      },
    });
  }
}
