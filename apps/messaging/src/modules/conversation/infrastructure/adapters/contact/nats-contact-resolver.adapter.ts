import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  FindPatientRequest,
  FindPatientResponse,
  NATS_CLIENT,
  NATS_SUBJECTS,
  RegisterAdReferralLeadRequest,
  RegisterAdReferralLeadResponse,
} from '@src/transport';
import {
  FindPatientIdPayload,
  IContactResolverPort,
  RegisterAdReferralLeadPayload,
} from '@modules/conversation/domain/ports/contact-resolver.port';

/** Core yanıt vermezse gelen mesaj beklemede kalmasın; misafir olarak devam edilir. */
const RPC_TIMEOUT_MS = 3_000;

/**
 * `IContactResolverPort`'un NATS implementasyonu — hasta/lead core'da yaşar.
 *
 * Yerel (in-process) sürümün yerini aldı; handler'lar değişmedi, çünkü ikisi de aynı
 * portu karşılıyor. Faz 1'de bu sınırı çekmemizin karşılığı bu.
 *
 * İki metot da **best-effort**: core erişilemezse `null` döner ve gelen mesaj yine
 * kaydedilir. Kontak çözümlemesi uğruna mesaj kaybedilmez — bu yüzden zaman aşımı var
 * ve hata yutuluyor.
 */
@Injectable()
export class NatsContactResolverAdapter implements IContactResolverPort {
  private readonly logger = new Logger(NatsContactResolverAdapter.name);

  constructor(@Inject(NATS_CLIENT) private readonly client: ClientProxy) {}

  async findPatientId(payload: FindPatientIdPayload): Promise<string | null> {
    const request: FindPatientRequest = {
      clinicId: payload.clinicId,
      channel: payload.channel,
      contactPhone: payload.contactPhone,
      matchPhone: payload.matchPhone,
    };

    return this.ask<FindPatientRequest, FindPatientResponse>(
      NATS_SUBJECTS.contact.findPatient,
      request,
      'Hasta eşleştirilemedi'
    );
  }

  async registerAdReferralLead(
    payload: RegisterAdReferralLeadPayload
  ): Promise<string | null> {
    const request: RegisterAdReferralLeadRequest = {
      clinicId: payload.clinicId,
      organizationId: payload.organizationId,
      channel: payload.channel,
      contactPhone: payload.contactPhone,
      contactName: payload.contactName,
      referral: payload.referral,
    };

    return this.ask<
      RegisterAdReferralLeadRequest,
      RegisterAdReferralLeadResponse
    >(
      NATS_SUBJECTS.contact.registerAdReferralLead,
      request,
      "Reklam referral lead'i üretilemedi"
    );
  }

  private async ask<TRequest, TResponse extends string | null>(
    subject: string,
    request: TRequest,
    failureMessage: string
  ): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.client
          .send<TResponse, TRequest>(subject, request)
          .pipe(timeout(RPC_TIMEOUT_MS))
      );
      return response ?? null;
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.warn(`${failureMessage}: ${reason}`);
      return null;
    }
  }
}
