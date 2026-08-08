import { DynamicModule, Module, ModuleMetadata, Provider } from '@nestjs/common';
import { ActorAuthenticator } from './actor-authenticator.service';
import { TokenAuthGuard } from './token-auth.guard';
import { TOKEN_VERIFIER } from './token-verifier.port';
import { ACTOR_CONTEXT_RESOLVER } from './actor-context-resolver.port';

export interface KernelAuthOptions {
  /** `TOKEN_VERIFIER` token'ını karşılayan sağlayıcı. */
  tokenVerifier: Provider;
  /** `ACTOR_CONTEXT_RESOLVER` token'ını karşılayan sağlayıcı. */
  actorContextResolver: Provider;
  /** Yukarıdaki adapter'ların bağımlılıklarını sağlayan modüller. */
  imports?: ModuleMetadata['imports'];
}

/**
 * Ortak auth çekirdeği.
 *
 * **Neden dinamik modül:** `ActorAuthenticator` iki porta bağımlıdır ve NestJS'te bir
 * sağlayıcı, kendisini *tanımlayan* modülün bağlamında çözülür. Portlar tüketen app'te
 * sağlanıp bu modül statik olsaydı, authenticator onları göremezdi. Bu yüzden portlar
 * `forRoot` ile içeri verilir — çekirdek onların ne olduğunu bilmeden bağlar.
 *
 * Çekirdek bu portları kendisi sağlamaz; sağlasaydı `firebase-admin`'e ve kullanıcı
 * tablolarına bağlanırdı, ayrılmanın amacı tam da bunu engellemek.
 *
 * ```ts
 * KernelAuthModule.forRoot({
 *   imports: [FirebaseModule, UserModule],
 *   tokenVerifier: { provide: TOKEN_VERIFIER, useClass: FirebaseTokenVerifier },
 *   actorContextResolver: { provide: ACTOR_CONTEXT_RESOLVER, useClass: DbActorContextResolver },
 * })
 * ```
 */
@Module({})
export class KernelAuthModule {
  static forRoot(options: KernelAuthOptions): DynamicModule {
    return {
      module: KernelAuthModule,
      imports: options.imports ?? [],
      providers: [
        options.tokenVerifier,
        options.actorContextResolver,
        ActorAuthenticator,
        TokenAuthGuard,
      ],
      // Port token'ları da dışa açılır: guard/authenticator dışında da tüketilebilirler
      // (ör. core'un RPC controller'ı `ACTOR_CONTEXT_RESOLVER`'ı messaging'e servis eder).
      exports: [
        ActorAuthenticator,
        TokenAuthGuard,
        TOKEN_VERIFIER,
        ACTOR_CONTEXT_RESOLVER,
      ],
    };
  }
}
