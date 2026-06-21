import { Injectable, Logger } from '@nestjs/common';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { IGetContext } from '@common/decorators';
import { ActorContext } from '@common/interfaces';
import { SYSTEM_ACTOR } from '@common/constants/system-actor.constant';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import {
  AiToolCall,
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
  IAiToolExecutor,
} from '@modules/messaging/ai-agent/domain/ports/ai-tool.port';
import {
  AI_TOOL_DEFINITIONS,
  AI_TOOL_NAMES,
} from './ai-tool.definitions';
import { FindTreatmentPackagesQuery } from '@modules/clinical/treatment-package/application/queries/find-treatment-packages/find-treatment-packages.query';
import { FindTreatmentPackagesResponse } from '@modules/clinical/treatment-package/application/queries/find-treatment-packages/find-treatment-packages.response';
import { FindTreatmentPackagesDto } from '@shared/modules/treatment-package/dto/queries';
import { FindAllProvidersQuery } from '@modules/clinical/provider/application/queries/find-all-providers/find-all-providers.query';
import { GetProviderAvailabilityQuery } from '@modules/clinical/appointment/application/queries/get-provider-availability/get-provider-availability.query';
import { GetProviderAvailabilityDto } from '@shared/modules/appointment/dto/queries/get-provider-availability.dto';
import { BookAppointmentCommand } from '@modules/clinical/appointment/application/commands/book-appointment/book-appointment.command';
import { BookAppointmentDto } from '@shared';
import { FindOneWithIdOrEmailQuery } from '@modules/identity/user/application/queries/find-one-with-id-or-email/find-one-with-id-or-email.query';
import { PaginationDto } from '@shared/common';
import { PaginationSchema } from '@shared';

/**
 * AI araçlarını klinik kapsamında CommandBus/QueryBus'a bağlayan çalıştırıcı. Cross-module
 * kuralı gereği yalnız hedef modüllerin query/command sınıflarını dispatch eder; repo/handler
 * inject etmez. Her dağıtım, kontaktan türetilen klinik-kapsamlı sistem context'i ile yapılır.
 */
@Injectable()
export class AiToolExecutor implements IAiToolExecutor {
  private readonly logger = new Logger(AiToolExecutor.name);

  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  getToolDefinitions(): AiToolDefinition[] {
    return AI_TOOL_DEFINITIONS;
  }

  async execute(
    call: AiToolCall,
    context: AiToolContext
  ): Promise<AiToolResult> {
    try {
      switch (call.name) {
        case AI_TOOL_NAMES.GET_CLINIC_SERVICES:
          return await this.getClinicServices(context);
        case AI_TOOL_NAMES.LIST_PROVIDERS:
          return await this.listProviders(context);
        case AI_TOOL_NAMES.CHECK_PROVIDER_AVAILABILITY:
          return await this.checkAvailability(call.input, context);
        case AI_TOOL_NAMES.BOOK_APPOINTMENT:
          return await this.bookAppointment(call.input, context);
        case AI_TOOL_NAMES.HANDOFF_TO_HUMAN:
          return this.handoff(call.input);
        default:
          return { content: `Bilinmeyen araç: ${call.name}` };
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.warn(`Araç çalıştırma hatası (${call.name}): ${reason}`);
      return {
        content: `Bu işlem şu anda gerçekleştirilemedi: ${reason}`,
      };
    }
  }

  /** Kontak bilgisinden klinik-kapsamlı sistem context'i kurar (yalnız bus dağıtımı için). */
  private buildClinicContext(context: AiToolContext): IGetContext {
    const actor: ActorContext = {
      ...SYSTEM_ACTOR,
      clinicId: context.clinicId,
      organizationId: context.organizationId,
      managedClinics: [{ id: context.clinicId }],
    };
    return {
      actor,
      source: ExecutionSources.INTERNAL_CASCADE,
      ip: '127.0.0.1',
      userAgent: 'AI_AGENT',
    };
  }

  private async getClinicServices(
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.buildClinicContext(context);
    const dto: FindTreatmentPackagesDto = {
      clinicId: context.clinicId,
      isActive: true,
      page: 1,
      limit: 50,
    } as FindTreatmentPackagesDto;

    const result = (await this.queryBus.execute(
      new FindTreatmentPackagesQuery(dto, ctx)
    )) as FindTreatmentPackagesResponse;

    const services = result.items.map((pkg) => ({
      name: pkg.name,
      price: pkg.price?.toString?.() ?? null,
      sessions: pkg.totalSessionCount,
    }));

    if (services.length === 0) {
      return { content: 'Tanımlı hizmet/paket bulunamadı.' };
    }
    return { content: JSON.stringify({ services }) };
  }

  private async listProviders(context: AiToolContext): Promise<AiToolResult> {
    const ctx = this.buildClinicContext(context);
    const pagination = PaginationSchema.parse({
      page: 1,
      limit: 50,
    }) as PaginationDto;
    const { data: providers } = await this.queryBus.execute(
      new FindAllProvidersQuery(ctx, pagination)
    );

    const active = providers.filter((p) => p.isActive);
    const resolved = await Promise.all(
      active.map(async (p) => {
        let name = 'Doktor';
        try {
          const { data: user } = await this.queryBus.execute(
            new FindOneWithIdOrEmailQuery(p.userId, ctx)
          );
          if (user?.displayName) name = user.displayName;
        } catch {
          // İsim çözülemezse id ile devam (araç bütünüyle başarısız olmamalı).
        }
        return { id: p.id, name };
      })
    );

    if (resolved.length === 0) {
      return { content: 'Randevu alınabilecek aktif doktor bulunamadı.' };
    }
    return { content: JSON.stringify({ providers: resolved }) };
  }

  private async checkAvailability(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.buildClinicContext(context);
    const dto: GetProviderAvailabilityDto = {
      providerId: String(input.providerId),
      clinicId: context.clinicId,
      startDate: new Date(String(input.startDate)),
      endDate: new Date(String(input.endDate)),
    } as GetProviderAvailabilityDto;

    const { data: days } = await this.queryBus.execute(
      new GetProviderAvailabilityQuery(dto, ctx)
    );

    const workingDays = days
      .filter((d) => d.isWorkingDay)
      .map((d) => ({
        date: d.date,
        workingHours: d.workingHours,
        occupiedSlots: d.occupiedSlots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      }));

    return { content: JSON.stringify({ workingDays }) };
  }

  private async bookAppointment(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.buildClinicContext(context);
    const patientPhone =
      typeof input.patientPhone === 'string' && input.patientPhone.length > 0
        ? input.patientPhone
        : context.contactPhone;

    const dto: BookAppointmentDto = {
      providerId: String(input.providerId),
      clinicId: context.clinicId,
      patientName: String(input.patientName),
      patientPhone,
      startTime: new Date(String(input.startTime)),
      duration: Number(input.durationMinutes),
      externalSystem: 'WHATSAPP',
    } as BookAppointmentDto;

    const appointmentId = await this.commandBus.execute(
      new BookAppointmentCommand(dto, ctx)
    );

    return {
      content: JSON.stringify({
        success: true,
        appointmentId,
        message: 'Randevu başarıyla oluşturuldu.',
      }),
    };
  }

  private handoff(input: Record<string, unknown>): AiToolResult {
    const reason =
      typeof input.reason === 'string' ? input.reason : 'Belirtilmedi';
    return {
      content: JSON.stringify({
        handoff: true,
        message:
          'Yazışma klinik ekibine devredildi. En kısa sürede bir yetkili dönüş yapacaktır.',
        reason,
      }),
      isHandoff: true,
    };
  }
}
