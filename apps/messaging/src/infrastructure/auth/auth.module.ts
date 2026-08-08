import { Global, Module } from '@nestjs/common';
import {
  ACTOR_CONTEXT_RESOLVER,
  KernelAuthModule,
  TOKEN_VERIFIER,
} from '@src/auth';
import { NatsClientModule } from '@src/transport';
import { FirebaseTokenVerifier } from './firebase-token-verifier.adapter';
import { NatsActorContextResolver } from './nats-actor-context.resolver';

/**
 * Messaging'in auth bağlaması — `apps/api` ile **aynı çekirdek**, farklı adapter'lar:
 * token imzası yerel doğrulanır (Firebase, DB gerekmez), `ActorContext` cache-miss'i
 * NATS ile core'a sorulur.
 *
 * `@Global`: `TokenAuthGuard` beş controller'da kullanılıyor, her presentation
 * modülünün ayrıca import etmesi gerekmesin.
 */
@Global()
@Module({
  imports: [
    KernelAuthModule.forRoot({
      imports: [NatsClientModule],
      tokenVerifier: { provide: TOKEN_VERIFIER, useClass: FirebaseTokenVerifier },
      actorContextResolver: {
        provide: ACTOR_CONTEXT_RESOLVER,
        useClass: NatsActorContextResolver,
      },
    }),
  ],
  exports: [KernelAuthModule],
})
export class MessagingAuthModule {}
