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
import { AI_TOOL_DEFINITIONS, AI_TOOL_NAMES } from './ai-tool.definitions';
import { FindTreatmentPackagesQuery } from '@modules/clinical/treatment-package/application/queries/find-treatment-packages/find-treatment-packages.query';
import { FindTreatmentPackagesResponse } from '@modules/clinical/treatment-package/application/queries/find-treatment-packages/find-treatment-packages.response';
import {
  FindPatientPackagesDto,
  FindTreatmentPackagesDto,
} from '@shared/modules/treatment-package/dto/queries';
import { FindPatientPackagesQuery } from '@modules/clinical/treatment-package/application/queries/find-patient-packages/find-patient-packages.query';
import { FindProvidersDirectoryQuery } from '@modules/clinical/provider/application/queries/find-providers-directory/find-providers-directory.query';
import { GetProviderAvailabilityQuery } from '@modules/clinical/appointment/application/queries/get-provider-availability/get-provider-availability.query';
import { GetProviderAvailabilityDto } from '@shared/modules/appointment/dto/queries/get-provider-availability.dto';
import { GetProviderOpenSlotsQuery } from '@modules/clinical/appointment/application/queries/get-provider-open-slots/get-provider-open-slots.query';
import { GetClinicTimezoneQuery } from '@modules/organization/clinic/application/queries/get-clinic-timezone/get-clinic-timezone.query';
import { TimeZoneType } from '@input-type-schemas/TimeZoneSchema';
import { BookAppointmentCommand } from '@modules/clinical/appointment/application/commands/book-appointment/book-appointment.command';
import {
  BookAppointmentDto,
  ExternalSystemSchema,
  PaginationSchema,
  PatientPackageStatusSchema,
  StaffRescheduleDto,
} from '@shared';
import { PaginationDto } from '@shared/common';
import { GetPatientAppointmentsQuery } from '@modules/clinical/appointment/application/queries/get-patient-appointments/get-patient-appointments.query';
import { GetAppointmentDetailQuery } from '@modules/clinical/appointment/application/queries/get-appointment-detail/get-appointment-detail.query';
import { PatientCancelAppointmentCommand } from '@modules/clinical/appointment/application/commands/patient-cancel-appointment/patient-cancel-appointment.command';
import { StaffRescheduleCommand } from '@modules/clinical/appointment/application/commands/staff-reschedule/staff-reschedule.command';
import { ConfirmAppointmentCommand } from '@modules/clinical/appointment/application/commands/confirm-appointment/confirm-appointment.command';
import { RedisService } from '@src/infrastructure/cache/redis/redis.service';
import { randomUUID } from 'crypto';
import { GetClinicHealthTourismConfigQuery } from '@modules/crm/health-tourism/config/application/queries/get-clinic-health-tourism-config/get-clinic-health-tourism-config.query';
import { SearchHotelsQuery } from '@modules/crm/health-tourism/hotel/application/queries/search-hotels/search-hotels.query';
import { GetHotelBookingsQuery } from '@modules/crm/health-tourism/hotel/application/queries/get-hotel-bookings/get-hotel-bookings.query';
import { CancelHotelBookingCommand } from '@modules/crm/health-tourism/hotel/application/commands/cancel-hotel-booking/cancel-hotel-booking.command';
import {
  GetHotelBookingsDto,
  GetTransferBookingsDto,
  SearchHotelsDto,
  SearchTransferAvailabilityDto,
} from '@shared/modules/health-tourism/dto/queries';
import {
  CancelHotelBookingDto,
  CancelTransferBookingDto,
} from '@shared/modules/health-tourism/dto/commands';
import { SearchTransferAvailabilityQuery } from '@modules/crm/health-tourism/transfer/application/queries/search-transfer-availability/search-transfer-availability.query';
import { GetTransferBookingsQuery } from '@modules/crm/health-tourism/transfer/application/queries/get-transfer-bookings/get-transfer-bookings.query';
import { CancelTransferBookingCommand } from '@modules/crm/health-tourism/transfer/application/commands/cancel-transfer-booking/cancel-transfer-booking.command';
import { InitiateBookingPaymentCommand } from '@modules/crm/health-tourism/booking-payment/application/commands/initiate-booking-payment/initiate-booking-payment.command';
import { RefundBookingPaymentCommand } from '@modules/crm/health-tourism/booking-payment/application/commands/refund-booking-payment/refund-booking-payment.command';
import { InitiateBookingPaymentResponse } from '@modules/crm/health-tourism/booking-payment/application/commands/initiate-booking-payment/initiate-booking-payment.response';
import {
  HotelBookingIntent,
  TransferBookingIntent,
} from '@modules/crm/health-tourism/booking-payment/domain/booking-payment.contracts';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { CancelAppointmentDto } from '@shared/modules/appointment/dto/commands/cancel-appointment.dto';
import { CreateLeadCommand } from '@modules/crm/lead/application/commands/create-lead/create-lead.command';
import { CreateLeadDto } from '@shared/modules/lead/dto/commands';
import { FindPatientByContactQuery } from '@modules/crm/patient/application/queries/find-patient-by-contact/find-patient-by-contact.query';
import {
  AppointmentStatusSchema,
  AppointmentStatusType as AppointmentStatus,
} from '@input-type-schemas/AppointmentStatusSchema';
import { DateTimeManager } from '@common/utils';

/** search_hotels'in Redis'e yazdığı, book_hotel'in optionId ile çözdüğü rezervasyon bağlamı. */
interface HotelRateOptionToken {
  hotelCode: string;
  hotelName: string;
  roomName: string;
  boardName: string;
  rateKey: string;
  checkIn: string;
  checkOut: string;
  net: number;
  currency: string;
  adults: number;
  children: number;
}

interface HotelPax {
  roomId: number;
  type: 'AD' | 'CH';
  name: string;
  surname: string;
  age?: number;
}

/** search_transfers'in Redis'e yazdığı, book_transfer'in optionId ile çözdüğü bağlam. */
interface TransferRateOptionToken {
  rateKey: string;
  direction: 'ARRIVAL' | 'DEPARTURE';
  vehicleName: string;
  categoryName: string;
  totalAmount: number;
  currency: string;
  fromCode: string;
  toCode: string;
}

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
    private readonly queryBus: TSQueryBus,
    private readonly redis: RedisService
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
        case AI_TOOL_NAMES.GET_PROVIDER_DETAILS:
          return await this.getProviderDetails(call.input, context);
        case AI_TOOL_NAMES.CHECK_PROVIDER_AVAILABILITY:
          return await this.checkAvailability(call.input, context);
        case AI_TOOL_NAMES.SUGGEST_APPOINTMENT_SLOTS:
          return await this.suggestSlots(call.input, context);
        case AI_TOOL_NAMES.BOOK_APPOINTMENT:
          return await this.bookAppointment(call.input, context);
        case AI_TOOL_NAMES.GET_PATIENT_APPOINTMENTS:
          return await this.getPatientAppointments(context);
        case AI_TOOL_NAMES.GET_PATIENT_PACKAGES:
          return await this.getPatientPackages(context);
        case AI_TOOL_NAMES.REGISTER_LEAD:
          return await this.registerLead(call.input, context);
        case AI_TOOL_NAMES.CANCEL_APPOINTMENT:
          return await this.cancelAppointment(call.input, context);
        case AI_TOOL_NAMES.RESCHEDULE_APPOINTMENT:
          return await this.rescheduleAppointment(call.input, context);
        case AI_TOOL_NAMES.CONFIRM_APPOINTMENT:
          return await this.confirmAppointment(call.input, context);
        case AI_TOOL_NAMES.SEARCH_HOTELS:
          return await this.searchHotels(call.input, context);
        case AI_TOOL_NAMES.BOOK_HOTEL:
          return await this.bookHotel(call.input, context);
        case AI_TOOL_NAMES.GET_HOTEL_BOOKINGS:
          return await this.getHotelBookings(context);
        case AI_TOOL_NAMES.CANCEL_HOTEL_BOOKING:
          return await this.cancelHotelBooking(call.input, context);
        case AI_TOOL_NAMES.SEARCH_TRANSFERS:
          return await this.searchTransfers(call.input, context);
        case AI_TOOL_NAMES.BOOK_TRANSFER:
          return await this.bookTransfer(call.input, context);
        case AI_TOOL_NAMES.GET_TRANSFER_BOOKINGS:
          return await this.getTransferBookings(context);
        case AI_TOOL_NAMES.CANCEL_TRANSFER_BOOKING:
          return await this.cancelTransferBooking(call.input, context);
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

  /** Kliniğin IANA zaman dilimini bus üzerinden çözer (yerel saat → UTC çevirimi için). */
  private async getClinicTimezone(
    context: AiToolContext
  ): Promise<TimeZoneType> {
    const { data } = await this.queryBus.execute(
      new GetClinicTimezoneQuery(context.clinicId)
    );
    return data;
  }

  private async getClinicServices(
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.buildClinicContext(context);
    const dto: FindTreatmentPackagesDto = {
      clinicId: context.clinicId,
      isActive: true,
      pagination: { page: 1, limit: 50 },
    } as FindTreatmentPackagesDto;

    const result = (await this.queryBus.execute(
      new FindTreatmentPackagesQuery(dto, ctx)
    )) as FindTreatmentPackagesResponse;

    const services = result.items.map((pkg) => ({
      name: pkg.name,
      price: pkg.price?.currency.toString?.() ?? null,
      sessions: pkg.totalSessionCount,
    }));

    if (services.length === 0) {
      return { content: 'Tanımlı hizmet/paket bulunamadı.' };
    }
    return { content: JSON.stringify({ services }) };
  }

  /**
   * Kliniğin aktif doktorlarını uzmanlık + unvan adlarıyla listeler (tek sorgu;
   * read-model FindProvidersDirectoryQuery). AI, hastanın anlattığı duruma göre buradan
   * doğru uzmanı seçer.
   */
  private async listProviders(context: AiToolContext): Promise<AiToolResult> {
    const { data: providers } = await this.queryBus.execute(
      new FindProvidersDirectoryQuery(context.clinicId)
    );

    if (providers.length === 0) {
      return { content: 'Randevu alınabilecek aktif doktor bulunamadı.' };
    }

    const list = providers.map((p) => ({
      id: p.providerId,
      name: p.name,
      specialty: p.specialty,
      title: p.title,
    }));
    return { content: JSON.stringify({ providers: list }) };
  }

  /** Tek bir doktorun ad/uzmanlık/unvan bilgisini döner (uzmanı hastaya tanıtmak için). */
  private async getProviderDetails(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const providerId = this.requireId(input.providerId);
    if (!providerId) {
      return { content: 'Geçerli bir doktor kimliği gerekli.' };
    }

    const { data: providers } = await this.queryBus.execute(
      new FindProvidersDirectoryQuery(context.clinicId)
    );
    const provider = providers.find((p) => p.providerId === providerId);
    if (!provider) {
      return { content: 'Doktor bulunamadı.' };
    }

    return {
      content: JSON.stringify({
        provider: {
          id: provider.providerId,
          name: provider.name,
          specialty: provider.specialty,
          title: provider.title,
        },
      }),
    };
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

  /**
   * Bir doktorun verilen gündeki hazır boş slotlarını (klinik yerel saatinde)
   * döner. AI bu çıktıyı doğrudan hastaya sunar — boş slot aritmetiği LLM'e
   * bırakılmaz (eskiden check_provider_availability + LLM hesabı yapılıyordu).
   */
  private async suggestSlots(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.buildClinicContext(context);
    const providerId = this.requireId(input.providerId);
    const date = typeof input.date === 'string' ? input.date.trim() : '';
    const durationMinutes =
      typeof input.durationMinutes === 'number' && input.durationMinutes > 0
        ? input.durationMinutes
        : 30;

    if (!providerId || !date) {
      return { content: 'Slot araması için geçerli doktor ve tarih gerekli.' };
    }

    const { data: slots } = await this.queryBus.execute(
      new GetProviderOpenSlotsQuery(
        { providerId, clinicId: context.clinicId, date, durationMinutes },
        ctx
      )
    );

    if (slots.length === 0) {
      return {
        content: JSON.stringify({
          date,
          slots: [],
          message: 'Bu güne ait sunulabilecek boş randevu saati bulunmuyor.',
        }),
      };
    }

    return {
      content: JSON.stringify({
        date,
        durationMinutes,
        slots: slots.map((s) => s.time),
      }),
    };
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

    // Yerel tarih+saat → klinik timezone üzerinden UTC (LLM çevirmez).
    const tz = await this.getClinicTimezone(context);
    const startTime = DateTimeManager.fromLocalDateTime(
      String(input.date),
      String(input.time),
      tz
    );

    const dto: BookAppointmentDto = {
      providerId: String(input.providerId),
      clinicId: context.clinicId,
      patientName: String(input.patientName),
      patientPhone,
      startTime,
      duration: Number(input.durationMinutes),
      externalSystem: ExternalSystemSchema.enum.WHATSAPP,
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

  /**
   * Yazışmaya bağlı hastanın yaklaşan (aktif) randevularını listeler. Gizlilik gereği
   * telefon/parametre almaz; yalnız context.patientId kapsamında çalışır. Hasta kaydına
   * bağlı olmayan (misafir) yazışmalarda randevu döndürmez.
   */
  private async getPatientAppointments(
    context: AiToolContext
  ): Promise<AiToolResult> {
    if (!context.patientId) {
      return {
        content:
          'Bu yazışma bir hasta kaydına bağlı olmadığından randevu listelenemedi.',
      };
    }

    const pagination = PaginationSchema.parse({
      page: 1,
      limit: 50,
    }) as PaginationDto;

    const { data: appointments } = await this.queryBus.execute(
      new GetPatientAppointmentsQuery(context.patientId, pagination)
    );

    const now = new Date();
    const upcoming = appointments
      .filter((a) => a.startTime >= now && this.isActiveStatus(a.status))
      .map((a) => ({
        appointmentId: a.id,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        treatmentType: a.treatmentType,
      }));

    if (upcoming.length === 0) {
      return { content: 'Yaklaşan aktif bir randevunuz bulunmuyor.' };
    }
    return { content: JSON.stringify({ appointments: upcoming }) };
  }

  /**
   * Yazışmaya bağlı hastanın satın aldığı tedavi paketlerini ve kalan seansını listeler.
   * Gizlilik gereği yalnız context.patientId kapsamlıdır; misafir yazışmalarda paket dönmez.
   */
  private async getPatientPackages(
    context: AiToolContext
  ): Promise<AiToolResult> {
    if (!context.patientId) {
      return {
        content:
          'Bu yazışma bir hasta kaydına bağlı olmadığından paketleriniz listelenemedi.',
      };
    }

    const ctx = this.buildClinicContext(context);
    const pagination = PaginationSchema.parse({
      page: 1,
      limit: 50,
    }) as PaginationDto;

    const dto: FindPatientPackagesDto = {
      patientId: context.patientId,
      pagination,
    } as FindPatientPackagesDto;

    const { data: packages } = await this.queryBus.execute(
      new FindPatientPackagesQuery(dto, ctx)
    );

    const result = packages.map((p) => {
      const used = p.usedExaminationCount + p.usedControlCount;
      return {
        packageName: null,
        status: p.status,
        totalSessions: null,
        usedSessions: used,
        remainingSessions: null,
        isActive: p.status === PatientPackageStatusSchema.enum.ACTIVE,
      };
    });

    if (result.length === 0) {
      return { content: 'Tanımlı bir tedavi paketiniz bulunmuyor.' };
    }
    return { content: JSON.stringify({ packages: result }) };
  }

  /**
   * Yeni müşteriyi (lead) kaydeder. KVKK onayı zorunludur (consent). Telefon:
   * WhatsApp'ta yazışılan numara zaten doğrulanmış olduğundan otomatik kullanılır;
   * hasta farklı bir numara verdiyse o kullanılır (doğrulanmamış — SMS OTP altyapısı yok).
   * Telegram/Instagram'da yazışma kimliği telefon olmadığından numara açıkça gerekir.
   * Mükerrer önleme: zaten kayıtlı hasta varsa yeni lead açılmaz.
   */
  private async registerLead(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    if (input.consent !== true) {
      return {
        content:
          'Kayıt için kişisel verilerin işlenmesine (KVKK) açık onay gerekli. Lütfen önce onayı al.',
      };
    }

    const name = typeof input.name === 'string' ? input.name.trim() : '';
    if (!name) {
      return { content: 'Kayıt için ad soyad gerekli.' };
    }

    const isWhatsApp = context.channel === 'WHATSAPP';
    const typedPhone =
      typeof input.phone === 'string' ? input.phone.trim() : '';
    // WhatsApp'ta contactPhone = doğrulanmış numara; diğer kanallarda kimlik (chatId/IGSID).
    const phone = typedPhone || (isWhatsApp ? context.contactPhone : '');
    if (!phone) {
      return {
        content:
          'Telefon numarası gerekli. Lütfen müşteriden numarasını paylaşmasını iste.',
      };
    }

    // Mükerrer önleme: yazışma zaten bir hastaya bağlıysa ya da numarayla kayıt varsa açma.
    if (context.patientId) {
      return {
        content: JSON.stringify({
          alreadyRegistered: true,
          message: 'Bu kişi sistemde zaten kayıtlı.',
        }),
      };
    }
    try {
      const { data: patient } = await this.queryBus.execute(
        new FindPatientByContactQuery(context.clinicId, phone)
      );
      if (patient) {
        return {
          content: JSON.stringify({
            alreadyRegistered: true,
            message: 'Bu numarayla zaten bir kayıt mevcut.',
          }),
        };
      }
    } catch {
      // Kayıt bulunamadı → yeni lead oluşturmaya devam.
    }

    const ctx = this.buildClinicContext(context);
    const dto: CreateLeadDto = {
      source: isWhatsApp ? 'WHATSAPP' : 'MANUAL',
      name,
      phone,
      notes: `AI sohbet asistanı üzerinden kayıt (kanal: ${context.channel}).`,
    } as CreateLeadDto;

    await this.commandBus.execute(
      new CreateLeadCommand(dto, context.clinicId, ctx)
    );

    return {
      content: JSON.stringify({
        success: true,
        message: `${name} adına kaydınız oluşturuldu.`,
      }),
    };
  }

  /**
   * Yazışmaya bağlı hastanın KENDİ randevusunu iptal eder. Sahiplik doğrulaması burada
   * yapılır (handler sistem kaynağında policy'yi bypass ettiği için güvenlik sınırı budur).
   * 2 saatten az kala anında iptal yerine ekibe iptal talebi iletilir.
   */
  private async cancelAppointment(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.buildClinicContext(context);
    const appointmentId = this.requireId(input.appointmentId);
    if (!appointmentId) {
      return { content: 'İptal için geçerli bir randevu kimliği gerekli.' };
    }

    const owned = await this.loadOwnedAppointment(appointmentId, context);
    if (!owned) {
      return {
        content:
          'Bu randevuyu adınıza doğrulayamadım; yalnızca size ait randevuları iptal edebilirim.',
      };
    }

    const dto: CancelAppointmentDto = {
      appointmentId,
      cancelReason: typeof input.reason === 'string' ? input.reason : undefined,
    };

    const result = await this.commandBus.execute(
      new PatientCancelAppointmentCommand(dto, ctx)
    );

    const message =
      result.status === 'CANCELLATION_REQUESTED'
        ? 'Randevunuza 2 saatten az kaldığı için iptal talebiniz klinik ekibine iletildi; en kısa sürede teyit edilecektir.'
        : 'Randevunuz başarıyla iptal edildi.';

    return { content: JSON.stringify({ status: result.status, message }) };
  }

  /**
   * Yazışmaya bağlı hastanın KENDİ randevusunu yeni tarih/saate erteler. Doktor korunur;
   * süre belirtilmezse mevcut randevu süresi kullanılır. Sahiplik doğrulaması zorunludur.
   */
  private async rescheduleAppointment(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.buildClinicContext(context);
    const appointmentId = this.requireId(input.appointmentId);
    if (!appointmentId) {
      return { content: 'Erteleme için geçerli bir randevu kimliği gerekli.' };
    }

    const owned = await this.loadOwnedAppointment(appointmentId, context);
    if (!owned) {
      return {
        content:
          'Bu randevuyu adınıza doğrulayamadım; yalnızca size ait randevuyu erteleyebilirim.',
      };
    }

    const durationMinutes =
      typeof input.newDurationMinutes === 'number' &&
      input.newDurationMinutes > 0
        ? input.newDurationMinutes
        : DateTimeManager.diffInMinutes(owned.endTime, owned.startTime);

    // Yerel tarih+saat → klinik timezone üzerinden UTC (LLM çevirmez).
    const tz = await this.getClinicTimezone(context);
    const startTime = DateTimeManager.fromLocalDateTime(
      String(input.newDate),
      String(input.newTime),
      tz
    );

    const dto: StaffRescheduleDto = {
      appointmentId,
      providerId: owned.providerId,
      startTime,
      duration: durationMinutes,
    } as StaffRescheduleDto;

    await this.commandBus.execute(new StaffRescheduleCommand(dto, ctx));

    return {
      content: JSON.stringify({
        success: true,
        message: 'Randevunuz yeni tarih/saate güncellendi.',
      }),
    };
  }

  /**
   * Yazışmaya bağlı hastanın KENDİ bekleyen randevusunu onaylar (PENDING → CONFIRMED).
   * Hatırlatmaya "geliyorum" yanıtı senaryosu. Sahiplik doğrulaması zorunludur; yalnız
   * bekleyen randevular onaylanabilir (entity invariant'ı handler'da korunur).
   */
  private async confirmAppointment(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.buildClinicContext(context);
    const appointmentId = this.requireId(input.appointmentId);
    if (!appointmentId) {
      return { content: 'Onay için geçerli bir randevu kimliği gerekli.' };
    }

    const owned = await this.loadOwnedAppointment(appointmentId, context);
    if (!owned) {
      return {
        content:
          'Bu randevuyu adınıza doğrulayamadım; yalnızca size ait randevuyu onaylayabilirim.',
      };
    }

    await this.commandBus.execute(
      new ConfirmAppointmentCommand(appointmentId, ctx)
    );

    return {
      content: JSON.stringify({
        success: true,
        message: 'Randevunuz onaylandı.',
      }),
    };
  }

  // ==========================================================================
  // SAĞLIK TURİZMİ — OTEL (B2)
  // ==========================================================================

  /** Klinik sağlık-turizmi config'ini bus üzerinden çözer; yoksa null. */
  private async getHealthTourismConfig(context: AiToolContext) {
    const ctx = this.buildClinicContext(context);
    const { data } = await this.queryBus.execute(
      new GetClinicHealthTourismConfigQuery(context.clinicId, ctx)
    );
    return data;
  }

  /**
   * Klinik çevresindeki anlaşmalı otellerde müsaitlik arar. Kapsam config'ten gelir:
   * allowlist (nearbyHotelCodes) öncelikli, yoksa şehir destinationCode. Her rate için kısa
   * optionId üretip rateKey'i Redis'e mühürler (LLM opak rateKey taşımaz — B1).
   */
  private async searchHotels(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.buildClinicContext(context);
    const config = await this.getHealthTourismConfig(context);
    if (!config || !config.isEnabled) {
      return {
        content: 'Bu klinikte otel rezervasyon hizmeti şu anda aktif değil.',
      };
    }

    // Allowlist öncelikli hibrit kapsam (B0 kararı).
    const hotelCodes =
      config.nearbyHotelCodes.length > 0 ? config.nearbyHotelCodes : undefined;
    const destinationCode = hotelCodes
      ? undefined
      : (config.destinationCode ?? undefined);
    if (!hotelCodes && !destinationCode) {
      return { content: 'Otel araması için klinik henüz yapılandırılmamış.' };
    }

    const checkIn = String(input.checkIn);
    const checkOut = String(input.checkOut);
    const adults =
      typeof input.adults === 'number' && input.adults > 0 ? input.adults : 1;
    const children =
      typeof input.children === 'number' && input.children > 0
        ? input.children
        : 0;
    const rooms =
      typeof input.rooms === 'number' && input.rooms > 0 ? input.rooms : 1;

    const dto: SearchHotelsDto = {
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      occupancies: [{ rooms, adults, children }],
      destinationCode,
      hotelCodes,
    } as SearchHotelsDto;

    const { data: hotels } = await this.queryBus.execute(
      new SearchHotelsQuery(dto, ctx)
    );

    // Tüm otel/oda/rate kombinasyonlarını düzleştir, ucuzdan pahalıya sırala.
    const tokens: HotelRateOptionToken[] = [];
    for (const hotel of hotels) {
      for (const room of hotel.rooms) {
        for (const rate of room.rates) {
          tokens.push({
            hotelCode: hotel.code,
            hotelName: hotel.name,
            roomName: room.name ?? room.code,
            boardName: rate.boardName ?? rate.boardCode,
            rateKey: rate.rateKey,
            checkIn,
            checkOut,
            net: rate.net,
            currency: rate.currency,
            adults,
            children,
          });
        }
      }
    }

    tokens.sort((a, b) => a.net - b.net);
    const top = tokens.slice(0, 6);
    if (top.length === 0) {
      return { content: 'Verilen tarihler için uygun otel/oda bulunamadı.' };
    }

    const options: Array<{
      optionId: string;
      hotel: string;
      room: string;
      board: string;
      totalPrice: number;
      currency: string;
    }> = [];
    for (const token of top) {
      const optionId = `ht_${randomUUID().slice(0, 8)}`;
      await this.redis.setHotelRateOption(optionId, token);
      options.push({
        optionId,
        hotel: token.hotelName,
        room: token.roomName,
        board: token.boardName,
        totalPrice: token.net,
        currency: token.currency,
      });
    }

    return { content: JSON.stringify({ checkIn, checkOut, options }) };
  }

  /**
   * Seçilen otel seçeneği (optionId → Redis'teki rateKey) için ÖDEME-ÖNCE tahsilat başlatır.
   * Rezervasyon HEMEN açılmaz; iki ödeme linki (iyzico TRY + Stripe EUR/USD) üretilir, hasta
   * birini ödeyince webhook rezervasyonu otomatik oluşturur (klinik maliyeti + iptal riski önlenir).
   */
  private async bookHotel(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const optionId = this.requireId(input.optionId);
    const holderName =
      typeof input.holderName === 'string' ? input.holderName.trim() : '';
    const holderSurname =
      typeof input.holderSurname === 'string' ? input.holderSurname.trim() : '';
    if (!optionId || !holderName || !holderSurname) {
      return {
        content: 'Rezervasyon için seçenek (optionId) ve ad soyad gerekli.',
      };
    }

    const option = (await this.redis.getHotelRateOption(
      optionId
    )) as HotelRateOptionToken | null;
    if (!option) {
      return {
        content:
          'Bu fiyat seçeneğinin süresi doldu. Lütfen tekrar arama yapın.',
      };
    }

    const paxes = this.buildHotelPaxes(option, {
      name: holderName,
      surname: holderSurname,
    });

    const config = await this.getHealthTourismConfig(context);
    const serviceFeePercent = config?.serviceFeePercent ?? 0;

    const intent: HotelBookingIntent = {
      type: 'HOTEL',
      hotelCode: option.hotelCode,
      hotelName: option.hotelName,
      checkIn: option.checkIn,
      checkOut: option.checkOut,
      holderName,
      holderSurname,
      rooms: [{ rateKey: option.rateKey, paxes }],
    };

    const payment = await this.commandBus.execute(
      new InitiateBookingPaymentCommand({
        bookingType: 'HOTEL',
        intent,
        netAmount: option.net,
        netCurrency: option.currency as CurrencyType,
        serviceFeePercent,
        buyer: {
          name: holderName,
          surname: holderSurname,
          email: '',
          phone: context.contactPhone ?? '',
        },
        clinicId: context.clinicId,
        organizationId: context.organizationId,
        patientId: context.patientId ?? null,
        leadId: context.patientId ? null : (context.leadId ?? null),
        conversationId: context.conversationId,
        ip: '127.0.0.1',
      })
    );

    return this.renderPaymentLinks(
      payment,
      `${option.hotelName} — ${option.checkIn} → ${option.checkOut}`
    );
  }

  /** Tek odalı pax listesi: ilk yetişkin = rezervasyon sahibi; kalanlar aynı soyadla doldurulur. */
  private buildHotelPaxes(
    option: HotelRateOptionToken,
    holder: { name: string; surname: string }
  ): HotelPax[] {
    const paxes: HotelPax[] = [];
    for (let i = 0; i < option.adults; i++) {
      paxes.push({
        roomId: 1,
        type: 'AD',
        name: i === 0 ? holder.name : 'Misafir',
        surname: holder.surname,
      });
    }
    for (let i = 0; i < option.children; i++) {
      paxes.push({
        roomId: 1,
        type: 'CH',
        name: 'Çocuk',
        surname: holder.surname,
        age: 8,
      });
    }
    return paxes;
  }

  /** Yazışmaya bağlı hastanın/lead'in aktif otel rezervasyonlarını listeler. */
  private async getHotelBookings(
    context: AiToolContext
  ): Promise<AiToolResult> {
    if (!context.patientId && !context.leadId) {
      return {
        content:
          'Bu yazışma bir kayda bağlı olmadığından otel rezervasyonu listelenemedi.',
      };
    }

    const { data } = await this.loadOwnedHotelBookings(context);
    const bookings = data
      .filter((b) => b.status !== 'CANCELLED')
      .map((b) => ({
        id: b.id,
        reference: b.reference,
        hotelCode: b.hotelCode,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status,
      }));

    if (bookings.length === 0) {
      return { content: 'Aktif otel rezervasyonunuz bulunmuyor.' };
    }
    return { content: JSON.stringify({ bookings }) };
  }

  /** Yazışmaya bağlı kişinin KENDİ otel rezervasyonunu iptal eder (sahiplik doğrulamalı). */
  private async cancelHotelBooking(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.buildClinicContext(context);
    const bookingId = this.requireId(input.bookingId);
    if (!bookingId) {
      return { content: 'İptal için geçerli bir rezervasyon kimliği gerekli.' };
    }
    if (!context.patientId && !context.leadId) {
      return { content: 'Bu rezervasyonu adınıza doğrulayamadım.' };
    }

    const { data: owned } = await this.loadOwnedHotelBookings(context);
    if (!owned.some((b) => b.id === bookingId)) {
      return {
        content:
          'Bu rezervasyonu adınıza doğrulayamadım; yalnızca size ait rezervasyonu iptal edebilirim.',
      };
    }

    const cancelDto: CancelHotelBookingDto = {
      bookingId,
    } as CancelHotelBookingDto;
    await this.commandBus.execute(
      new CancelHotelBookingCommand(cancelDto, ctx)
    );

    const refunded = await this.refundForCancelledBooking(bookingId);

    return {
      content: JSON.stringify({
        success: true,
        message: refunded
          ? 'Otel rezervasyonunuz iptal edildi ve ödemeniz iade ediliyor.'
          : 'Otel rezervasyonunuz iptal edildi. Ödeme iadeniz için ekibimiz sizinle iletişime geçecek.',
      }),
    };
  }

  /** Yazışmaya bağlı kişinin (patientId öncelikli, yoksa leadId) otel rezervasyonlarını çeker. */
  private async loadOwnedHotelBookings(context: AiToolContext) {
    const ctx = this.buildClinicContext(context);
    const dto: GetHotelBookingsDto = {
      pagination: { page: 1, limit: 50 },
      patientId: context.patientId ?? undefined,
      leadId: context.patientId ? undefined : (context.leadId ?? undefined),
    } as GetHotelBookingsDto;
    const { data } = await this.queryBus.execute(
      new GetHotelBookingsQuery(dto, ctx)
    );
    return { data };
  }

  // ==========================================================================
  // SAĞLIK TURİZMİ — TRANSFER (B3)
  // ==========================================================================

  /**
   * Havalimanı ↔ klinik transfer seçeneklerini arar. Nereden/nereye config'ten gelir:
   * ARRIVAL = havalimanı(IATA) → klinik(ATLAS/GPS), DEPARTURE tersi. Her rate için kısa
   * optionId üretip rateKey'i Redis'e mühürler (LLM opak rateKey taşımaz).
   */
  private async searchTransfers(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.buildClinicContext(context);
    const config = await this.getHealthTourismConfig(context);
    if (!config || !config.isEnabled) {
      return {
        content: 'Bu klinikte transfer hizmeti şu anda aktif değil.',
      };
    }
    if (
      !config.airportIata ||
      !config.clinicLocationType ||
      !config.clinicLocationCode
    ) {
      return { content: 'Transfer için klinik henüz yapılandırılmamış.' };
    }

    const direction = input.direction === 'DEPARTURE' ? 'DEPARTURE' : 'ARRIVAL';
    const isArrival = direction === 'ARRIVAL';
    const airport = { type: 'IATA', code: config.airportIata };
    const clinic = {
      type: config.clinicLocationType,
      code: config.clinicLocationCode,
    };
    const from = isArrival ? airport : clinic;
    const to = isArrival ? clinic : airport;

    const adults =
      typeof input.adults === 'number' && input.adults > 0 ? input.adults : 1;
    const children =
      typeof input.children === 'number' && input.children > 0
        ? input.children
        : 0;
    const infants =
      typeof input.infants === 'number' && input.infants > 0
        ? input.infants
        : 0;

    const dto: SearchTransferAvailabilityDto = {
      language: 'en',
      fromType: from.type,
      fromCode: from.code,
      toType: to.type,
      toCode: to.code,
      outboundDate: String(input.date),
      outboundTime: String(input.time),
      adults,
      children,
      infants,
    } as SearchTransferAvailabilityDto;

    const { data: items } = await this.queryBus.execute(
      new SearchTransferAvailabilityQuery(dto, ctx)
    );

    const sorted = [...items].sort(
      (a, b) => a.price.totalAmount - b.price.totalAmount
    );
    const top = sorted.slice(0, 6);
    if (top.length === 0) {
      return { content: 'Verilen tarih/saat için uygun transfer bulunamadı.' };
    }

    const options: Array<{
      optionId: string;
      vehicle: string;
      category: string;
      price: number;
      currency: string;
    }> = [];
    for (const item of top) {
      const optionId = `tr_${randomUUID().slice(0, 8)}`;
      const token: TransferRateOptionToken = {
        rateKey: item.rateKey,
        direction,
        vehicleName: item.vehicle.name,
        categoryName: item.category.name,
        totalAmount: item.price.totalAmount,
        currency: item.price.currencyId,
        fromCode: from.code,
        toCode: to.code,
      };
      await this.redis.setTransferRateOption(optionId, token);
      options.push({
        optionId,
        vehicle: item.vehicle.name,
        category: item.category.name,
        price: item.price.totalAmount,
        currency: item.price.currencyId,
      });
    }

    return { content: JSON.stringify({ direction, options }) };
  }

  /**
   * Seçilen transfer seçeneği (optionId → Redis'teki rateKey) için ÖDEME-ÖNCE tahsilat başlatır.
   * Uçuş kodu + e-posta + telefon zorunlu. Rezervasyon HEMEN açılmaz; iki ödeme linki üretilir,
   * ödeme onaylanınca webhook rezervasyonu otomatik oluşturur.
   */
  private async bookTransfer(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const optionId = this.requireId(input.optionId);
    const holderName =
      typeof input.holderName === 'string' ? input.holderName.trim() : '';
    const holderSurname =
      typeof input.holderSurname === 'string' ? input.holderSurname.trim() : '';
    const holderEmail =
      typeof input.holderEmail === 'string' ? input.holderEmail.trim() : '';
    const holderPhone =
      typeof input.holderPhone === 'string' ? input.holderPhone.trim() : '';
    const flightCode =
      typeof input.flightCode === 'string' ? input.flightCode.trim() : '';

    if (
      !optionId ||
      !holderName ||
      !holderSurname ||
      !holderEmail ||
      !holderPhone ||
      !flightCode
    ) {
      return {
        content:
          'Transfer rezervasyonu için seçenek, ad soyad, e-posta, telefon ve uçuş numarası gerekli.',
      };
    }

    const option = (await this.redis.getTransferRateOption(
      optionId
    )) as TransferRateOptionToken | null;
    if (!option) {
      return {
        content:
          'Bu transfer seçeneğinin süresi doldu. Lütfen tekrar arama yapın.',
      };
    }

    const config = await this.getHealthTourismConfig(context);
    const serviceFeePercent = config?.serviceFeePercent ?? 0;

    const intent: TransferBookingIntent = {
      type: 'TRANSFER',
      language: 'en',
      vehicleName: option.vehicleName,
      holderName,
      holderSurname,
      holderEmail,
      holderPhone,
      transfers: [
        {
          rateKey: option.rateKey,
          transferDetails: [
            { type: 'FLIGHT', direction: option.direction, code: flightCode },
          ],
        },
      ],
    };

    const payment = await this.commandBus.execute(
      new InitiateBookingPaymentCommand({
        bookingType: 'TRANSFER',
        intent,
        netAmount: option.totalAmount,
        netCurrency: option.currency as CurrencyType,
        serviceFeePercent,
        buyer: {
          name: holderName,
          surname: holderSurname,
          email: holderEmail,
          phone: holderPhone,
        },
        clinicId: context.clinicId,
        organizationId: context.organizationId,
        patientId: context.patientId ?? null,
        leadId: context.patientId ? null : (context.leadId ?? null),
        conversationId: context.conversationId,
        ip: '127.0.0.1',
      })
    );

    return this.renderPaymentLinks(payment, `Transfer — ${option.vehicleName}`);
  }

  /**
   * İki ödeme linkini (iyzico TRY / Stripe EUR-USD) AI'a sunulacak biçimde döner. AI hastaya
   * her iki linki de iletir: Türkiye'den ödeyecekse iyzico (TRY), yurt dışından ödeyecekse Stripe.
   * Ödeme onaylandığında rezervasyon otomatik oluşur.
   */
  private renderPaymentLinks(
    payment: InitiateBookingPaymentResponse,
    summary: string
  ): AiToolResult {
    const tryLink = payment.iyzico
      ? {
          url: payment.iyzico.url,
          amount: payment.iyzico.amount,
          currency: 'TRY',
          label: "Türkiye'den ödeme (iyzico)",
        }
      : null;
    const fxLink = payment.stripe
      ? {
          url: payment.stripe.url,
          amount: payment.stripe.amount,
          currency: payment.stripe.currency,
          label: 'Yurt dışından ödeme (kredi kartı / Stripe)',
        }
      : null;

    return {
      content: JSON.stringify({
        paymentRequired: true,
        summary,
        tryLink,
        fxLink,
        message:
          "Rezervasyonu kesinleştirmek için ödeme gerekli. Türkiye'den ödeyecekseniz TRY (iyzico) linkini, yurt dışından ödeyecekseniz EUR/USD (Stripe) linkini kullanın.",
        note: 'Ödemeniz onaylandığında rezervasyonunuz otomatik oluşturulacaktır.',
      }),
    };
  }

  /** Yazışmaya bağlı hastanın/lead'in aktif transfer rezervasyonlarını listeler. */
  private async getTransferBookings(
    context: AiToolContext
  ): Promise<AiToolResult> {
    if (!context.patientId && !context.leadId) {
      return {
        content:
          'Bu yazışma bir kayda bağlı olmadığından transfer rezervasyonu listelenemedi.',
      };
    }

    const items = await this.loadOwnedTransferBookings(context);
    const bookings = items
      .filter((b) => b.status !== 'CANCELLED')
      .map((b) => ({
        reference: b.reference,
        status: b.status,
        holderName: `${b.holderName} ${b.holderSurname}`,
      }));

    if (bookings.length === 0) {
      return { content: 'Aktif transfer rezervasyonunuz bulunmuyor.' };
    }
    return { content: JSON.stringify({ bookings }) };
  }

  /** Yazışmaya bağlı kişinin KENDİ transfer rezervasyonunu iptal eder (sahiplik doğrulamalı). */
  private async cancelTransferBooking(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.buildClinicContext(context);
    const reference =
      typeof input.reference === 'string' ? input.reference.trim() : '';
    if (!reference) {
      return {
        content: 'İptal için geçerli bir rezervasyon referansı gerekli.',
      };
    }
    if (!context.patientId && !context.leadId) {
      return { content: 'Bu rezervasyonu adınıza doğrulayamadım.' };
    }

    const items = await this.loadOwnedTransferBookings(context);
    const owned = items.find((b) => b.reference === reference);
    if (!owned) {
      return {
        content:
          'Bu rezervasyonu adınıza doğrulayamadım; yalnızca size ait rezervasyonu iptal edebilirim.',
      };
    }

    const cancelDto: CancelTransferBookingDto = {
      reference,
      language: 'en',
    } as CancelTransferBookingDto;
    await this.commandBus.execute(
      new CancelTransferBookingCommand(cancelDto, ctx)
    );

    // İade dahili rezervasyon id'si (owned.id) ile BookingPayment'a bağlanır.
    const refunded = await this.refundForCancelledBooking(owned.id);

    return {
      content: JSON.stringify({
        success: true,
        message: refunded
          ? 'Transfer rezervasyonunuz iptal edildi ve ödemeniz iade ediliyor.'
          : 'Transfer rezervasyonunuz iptal edildi. Ödeme iadeniz için ekibimiz sizinle iletişime geçecek.',
      }),
    };
  }

  /**
   * İptal edilen rezervasyon için ödeme iadesini (varsa) tetikler. Ödeme kaydı yoksa (B7
   * öncesi/ödemesiz rezervasyon) veya iade başarısızsa false döner — iptal mesajı yine de döner.
   */
  private async refundForCancelledBooking(bookingId: string): Promise<boolean> {
    try {
      await this.commandBus.execute(
        new RefundBookingPaymentCommand(bookingId, 'Rezervasyon iptal edildi.')
      );
      return true;
    } catch (err) {
      this.logger.warn(
        `İptal sonrası iade tetiklenemedi (bookingId=${bookingId}): ${
          err instanceof Error ? err.message : err
        }`
      );
      return false;
    }
  }

  /** Yazışmaya bağlı kişinin (patientId öncelikli, yoksa leadId) transfer rezervasyonları. */
  private async loadOwnedTransferBookings(context: AiToolContext) {
    const ctx = this.buildClinicContext(context);
    const dto: GetTransferBookingsDto = {
      clinicId: context.clinicId,
      pagination: {
        page: 1,
        limit: 50,
      },
      patientId: context.patientId ?? undefined,
      leadId: context.patientId ? undefined : (context.leadId ?? undefined),
    } as GetTransferBookingsDto;
    const { data } = await this.queryBus.execute(
      new GetTransferBookingsQuery(dto, ctx)
    );
    return data;
  }

  /**
   * Randevunun yazışmadaki hastaya ait olduğunu doğrular. Misafir (patientId yok) veya
   * başka hastaya ait randevularda null döner; çağıran işlemi reddeder.
   */
  private async loadOwnedAppointment(
    appointmentId: string,
    context: AiToolContext
  ) {
    if (!context.patientId) return null;
    const ctx = this.buildClinicContext(context);
    try {
      const { data: detail } = await this.queryBus.execute(
        new GetAppointmentDetailQuery(appointmentId, ctx)
      );
      if (!detail || detail.patientId !== context.patientId) return null;
      return detail;
    } catch {
      return null;
    }
  }

  private isActiveStatus(status: AppointmentStatus): boolean {
    const inactive: AppointmentStatus[] = [
      AppointmentStatusSchema.enum.CANCELLED,
      AppointmentStatusSchema.enum.COMPLETED,
      AppointmentStatusSchema.enum.NOSHOW,
    ];
    return !inactive.includes(status);
  }

  private requireId(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0
      ? value.trim()
      : null;
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
