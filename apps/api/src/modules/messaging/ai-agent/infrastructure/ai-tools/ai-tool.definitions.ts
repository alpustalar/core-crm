import { AiToolDefinition } from '@modules/messaging/ai-agent/domain/ports/ai-tool.port';

/** AI araç adları (executor switch + tanımlar tek kaynaktan). */
export const AI_TOOL_NAMES = {
  GET_CLINIC_SERVICES: 'get_clinic_services',
  LIST_PROVIDERS: 'list_providers',
  CHECK_PROVIDER_AVAILABILITY: 'check_provider_availability',
  BOOK_APPOINTMENT: 'book_appointment',
  HANDOFF_TO_HUMAN: 'handoff_to_human',
} as const;

/**
 * AI sohbet asistanına sunulan araçların (function calling) tanımları. inputSchema'lar
 * JSON Schema'dır; adapter bunları Anthropic `input_schema` formatına birebir geçirir.
 * Tüm araçlar klinik kapsamında bus üzerinden çalışır (AiToolExecutor).
 */
export const AI_TOOL_DEFINITIONS: AiToolDefinition[] = [
  {
    name: AI_TOOL_NAMES.GET_CLINIC_SERVICES,
    description:
      'Kliniğin sunduğu tedavi/hizmet paketlerini ve fiyatlarını listeler. Hasta fiyat veya hizmet sorduğunda kullan.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.LIST_PROVIDERS,
    description:
      'Klinikteki randevu alınabilecek doktorları (id ve ad) listeler. Müsaitlik bakmadan veya randevu oluşturmadan önce doğru providerId için kullan.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.CHECK_PROVIDER_AVAILABILITY,
    description:
      'Bir doktorun verilen tarih aralığındaki çalışma günleri, çalışma saatleri ve dolu slotlarını döner. Önce list_providers ile providerId al.',
    inputSchema: {
      type: 'object',
      properties: {
        providerId: {
          type: 'string',
          description: 'Doktorun id\'si (list_providers çıktısından).',
        },
        startDate: {
          type: 'string',
          description: 'Başlangıç tarihi, ISO formatı (YYYY-MM-DD).',
        },
        endDate: {
          type: 'string',
          description: 'Bitiş tarihi, ISO formatı (YYYY-MM-DD).',
        },
      },
      required: ['providerId', 'startDate', 'endDate'],
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.BOOK_APPOINTMENT,
    description:
      'Hasta için randevu oluşturur. Yalnızca hastadan doktor, tarih/saat ve süre için açık onay aldıktan sonra çağır. Müsaitliği önce check_provider_availability ile doğrula.',
    inputSchema: {
      type: 'object',
      properties: {
        providerId: {
          type: 'string',
          description: 'Randevunun doktoru (list_providers çıktısından).',
        },
        patientName: {
          type: 'string',
          description: 'Hastanın adı soyadı.',
        },
        patientPhone: {
          type: 'string',
          description:
            'Hastanın telefon numarası (boş bırakılırsa kişinin WhatsApp numarası kullanılır).',
        },
        startTime: {
          type: 'string',
          description:
            'Randevu başlangıcı, tam ISO 8601 zaman damgası (örn. 2026-06-25T09:00:00.000Z). Dakika 5\'in katı olmalı.',
        },
        durationMinutes: {
          type: 'number',
          description: 'Randevu süresi (dakika), 5\'in katı. Belirsizse 30.',
        },
      },
      required: ['providerId', 'patientName', 'startTime', 'durationMinutes'],
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.HANDOFF_TO_HUMAN,
    description:
      'Soruyu yanıtlayamadığında, hasta bir yetkiliyle/insanla görüşmek istediğinde veya tıbbi tavsiye gerektiğinde yazışmayı klinik ekibine devreder.',
    inputSchema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Devir gerekçesinin kısa özeti (klinik ekibi için).',
        },
      },
      required: ['reason'],
      additionalProperties: false,
    },
  },
];
