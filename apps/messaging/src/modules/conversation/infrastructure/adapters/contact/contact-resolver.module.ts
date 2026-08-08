import { Module } from '@nestjs/common';
import { NatsClientModule } from '@src/transport';
import { CONTACT_RESOLVER_PORT } from '@modules/conversation/domain/ports/contact-resolver.port';
import { NatsContactResolverAdapter } from './nats-contact-resolver.adapter';

/**
 * Kontak çözümleme port'unun NATS bağlaması.
 *
 * Önceden burada aynı-process bir adapter vardı ve core'un `PatientQueryModule`'ünü
 * import ediyordu. Messaging ayrı sürece çıkınca yalnız **bu dosya** değişti;
 * handler'lar `CONTACT_RESOLVER_PORT` token'ını gördüğü için dokunulmadı.
 */
@Module({
  imports: [NatsClientModule],
  providers: [
    { provide: CONTACT_RESOLVER_PORT, useClass: NatsContactResolverAdapter },
  ],
  exports: [CONTACT_RESOLVER_PORT],
})
export class ContactResolverModule {}
