import { Injectable, Logger } from '@nestjs/common';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { IGetContext } from '@common/decorators';
import { ActorContext } from '@common/interfaces';
import { SYSTEM_ACTOR } from '@common/constants/system-actor.constant';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import { MessageChannelSchema } from '@shared';
import { CreateLeadDto } from '@shared/modules/lead/dto/commands';
import { FindPatientByContactQuery } from '@modules/crm/patient/application/queries/find-patient-by-contact/find-patient-by-contact.query';
import { CreateLeadCommand } from '@modules/crm/lead/application/commands/create-lead/create-lead.command';
import {
  FindPatientIdPayload,
  IContactResolverPort,
  RegisterAdReferralLeadPayload,
} from '@modules/messaging/conversation/domain/ports/contact-resolver.port';

/**
 * `IContactResolverPort`'un aynı-process (monolit) implementasyonu: core'a CommandBus /
 * QueryBus üzerinden gider. Core sözleşmelerine (`FindPatientByContactQuery`,
 * `CreateLeadCommand`, `CreateLeadDto`) bağlı **tek** messaging dosyası burasıdır —
 * Faz 3'te bu dosyanın yerini bir NATS istemci adapter'ı alır, handler değişmez.
 */
@Injectable()
export class LocalContactResolverAdapter implements IContactResolverPort {
  private readonly logger = new Logger(LocalContactResolverAdapter.name);

  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  async findPatientId(payload: FindPatientIdPayload): Promise<string | null> {
    // Telegram/Instagram'da contactPhone bir kimlik numarasıdır; telefon olarak
    // sorgulamak yanlış hastayla eşleşmeye yol açardı.
    const phone =
      payload.matchPhone ??
      (payload.channel === MessageChannelSchema.enum.WHATSAPP
        ? payload.contactPhone
        : null);
    if (!phone) return null;

    try {
      const { data: patient } = await this.queryBus.execute(
        new FindPatientByContactQuery({ clinicId: payload.clinicId, phone })
      );
      return patient?.id ?? null;
    } catch {
      // Hasta bulunamadı → misafir olarak devam (eşleme mesajı bloklamaz).
      return null;
    }
  }

  async registerAdReferralLead(
    payload: RegisterAdReferralLeadPayload
  ): Promise<string | null> {
    const { channel, referral } = payload;

    const dto: CreateLeadDto = {
      source: channel, // WHATSAPP | INSTAGRAM | TELEGRAM — LeadSource ile örtüşür
      name: payload.contactName ?? undefined,
      phone:
        channel === MessageChannelSchema.enum.WHATSAPP
          ? payload.contactPhone
          : undefined,
      medium: 'AD',
      adId: referral.adId ?? undefined,
      ctwaClid: referral.ctwaClid ?? undefined,
      sourceUrl: referral.sourceUrl ?? undefined,
    } as CreateLeadDto;

    try {
      return await this.commandBus.execute(
        new CreateLeadCommand({
          data: dto,
          clinicId: payload.clinicId,
          ctx: this.buildSystemContext(
            payload.clinicId,
            payload.organizationId
          ),
        })
      );
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.warn(`Reklam referral lead'i üretilemedi: ${reason}`);
      // Lead üretimi mesaj işlemeyi bloklamaz (attribution best-effort).
      return null;
    }
  }

  /** Webhook (actor'sız) akışı için sistem yürütme context'i. */
  private buildSystemContext(
    clinicId: string,
    organizationId: string
  ): IGetContext {
    const actor: ActorContext = {
      ...SYSTEM_ACTOR,
      clinicId,
      organizationId,
      managedClinics: [{ id: clinicId }],
    };
    return {
      actor,
      source: ExecutionSources.INTERNAL_CASCADE,
      ip: '127.0.0.1',
      userAgent: 'WEBHOOK',
    };
  }
}
