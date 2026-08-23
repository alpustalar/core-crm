import { Injectable, NotFoundException } from '@nestjs/common';
import { ActorContext } from '@common/interfaces';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { IActorContextResolverPort, VerifiedToken } from '@src/auth';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { GlobalStatusSchema } from '@input-type-schemas/GlobalStatusSchema';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { rolesCreateManyInputs } from '@src/infrastructure/persistence/prisma/data/modules';
import { FindUserForAuthQuery } from '@modules/identity/user/application/queries/find-user-for-auth/find-user-for-auth.query';
import type { AuthUserResponse } from '@modules/identity/user/domain/contracts/user.contracts';
import { Priority } from '@src/domain/value-objects/priority.vo';

// TODO: PROD'TA KALDIR
// `includes` ALT DİZE eşleşmesiydi: ADMIN_EMAIL="admin@klinik.com" iken
// "min@klinik.co" ile giriş yapan kullanıcı da sistem admini oluyordu. Liste
// virgülle ayrılıp TAM eşitlik aranır.
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const isDevelopment = process.env.MODE === 'DEVELOPMENT';
//

/**
 * `ActorContext`'i kaynağından — kullanıcı/rol tablolarından — çözer.
 *
 * Yalnız cache-miss'te çağrılır; normal yolda `ActorAuthenticator` Redis'ten okur.
 * `apps/messaging` bu portu NATS istemcisiyle karşılayacak (kendi kullanıcı tablosu yok).
 */
@Injectable()
export class DbActorContextResolver implements IActorContextResolverPort {
  constructor(
    private readonly queryBus: TSQueryBus,
    // TODO: prod'ta prisma service kaldır (yalnız createAdmin için duruyor)
    private readonly prismaService: PrismaService
  ) {}

  async resolve(token: VerifiedToken): Promise<ActorContext | null> {
    // TODO: prod'ta bu satırı kaldır
    if (isDevelopment) await this.createAdmin(token);

    const { data: user } = await this.queryBus.execute(
      new FindUserForAuthQuery(token.uid)
    );

    if (!user) return null;

    return {
      userId: user.id,
      email: user.email,
      capabilities: this.mergeCapabilities(user),
      rolePriority: user.role?.priority ?? 0,
      source: LogSource.SYSTEM,
      managedClinics: user.managedClinics.map(({ id }) => ({ id })),
      ownedOrganizations: user.ownedOrganizations ?? [],
      organizationId: this.resolveOrganizationId(user),
      roleId: user.roleId ?? undefined,
      role: user.role ?? undefined,
      clinicId: user.clinicId ?? undefined,
      providerId: user.providerProfile?.id ?? undefined,
    };
  }

  /**
   * Aktörün kiracı (organizasyon) kimliği — YALNIZ belirsizlik yoksa.
   *
   * `User` tablosunda `organizationId` kolonu yoktur; bağ üç yerden gelebilir:
   * çalışılan klinik, yönetilen klinikler ve sahip olunan organizasyonlar. Üçünün
   * birleşimi tek bir kimliğe işaret ediyorsa aktörün kiracısı odur.
   *
   * **`ownedOrganizations[0]` bilinçli olarak KULLANILMAZ.** Prisma ilişkili
   * satırları `orderBy` verilmedikçe garantili bir sırada döndürmez: iki
   * organizasyona sahip bir kullanıcıda `[0]` istekler arasında değişebilir ve
   * kayıtlar sessizce yanlış kiracıya damgalanır — hiçbir filtrenin sonradan
   * yakalayamayacağı bir bozulma. Kimlik tahmin edilmez.
   *
   * Birleşim birden fazla kimlik içeriyorsa `undefined` döner: hangi kiracı adına
   * çalışıldığı artık isteğin kapsamıdır (clinicId), aktörün kimliği değil.
   * Tüketiciler bu durumda kapıyı kapatır (kapsamsız okuma/yazma yapılmaz).
   */
  private resolveOrganizationId(
    user: NonNullable<AuthUserResponse>
  ): string | undefined {
    const organizationIds = new Set<string>();

    if (user.workingClinic)
      organizationIds.add(user.workingClinic.organizationId);
    user.managedClinics.forEach((clinic) =>
      organizationIds.add(clinic.organizationId)
    );
    user.ownedOrganizations.forEach((organization) =>
      organizationIds.add(organization.id)
    );

    if (organizationIds.size !== 1) return undefined;

    return [...organizationIds][0];
  }

  /**
   * Aktörün etkin yetkileri = rol yetkileri ∪ kişiye özel verilmiş yetkiler.
   *
   * İki kaynak da aynı `module:action` dizesini üretebildiği için tekilleştirilir;
   * aksi hâlde `capabilities` dizisi kopyalar taşır ve "kaç yetkisi var" gibi her
   * sayım yanlış çıkar. Kişisel yetkiler yalnız EKLER — rolden düşürme yoktur,
   * o yüzden kesişimi/farkı hesaplamaya gerek kalmaz.
   */
  private mergeCapabilities(user: {
    role?: {
      capabilities: { capability: { module: string; action: string } }[];
    } | null;
    grantedCapabilities?: { capability: { module: string; action: string } }[];
  }): string[] {
    const toKey = ({
      capability,
    }: {
      capability: { module: string; action: string };
    }) => `${capability.module}:${capability.action}`;

    return [
      ...new Set([
        ...(user.role?.capabilities ?? []).map(toKey),
        ...(user.grantedCapabilities ?? []).map(toKey),
      ]),
    ];
  }

  // TODO: prod'ta create admin kaldır
  private async createAdmin(token: VerifiedToken): Promise<void> {
    const { uid: id, email } = token;
    if (!email || !ADMIN_EMAILS.includes(email.toLowerCase())) return;

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
