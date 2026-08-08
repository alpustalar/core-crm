import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PatientQueryModule } from '@modules/crm/patient/application/queries/query.module';
import { CONTACT_RESOLVER_PORT } from '@modules/messaging/conversation/domain/ports/contact-resolver.port';
import { LocalContactResolverAdapter } from './local-contact-resolver.adapter';

/**
 * Kontak çözümleme port'unun aynı-process bağlaması. Core'a giden bağımlılıklar
 * (`PatientQueryModule`) bu modülde toplanır; messaging'in geri kalanı yalnız
 * `CONTACT_RESOLVER_PORT` token'ını görür. Faz 3'te bu modülün yerini NATS istemcisini
 * bağlayan bir modül alır.
 */
@Module({
  imports: [CqrsModule, PatientQueryModule],
  providers: [
    { provide: CONTACT_RESOLVER_PORT, useClass: LocalContactResolverAdapter },
  ],
  exports: [CONTACT_RESOLVER_PORT],
})
export class ContactResolverModule {}
