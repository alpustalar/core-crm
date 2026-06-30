import { AiToolDefinition } from '@modules/messaging/ai-agent/domain/ports/ai-tool.port';

/** AI araç adları (executor switch + tanımlar tek kaynaktan). */
export const AI_TOOL_NAMES = {
  GET_CLINIC_SERVICES: 'get_clinic_services',
  LIST_PROVIDERS: 'list_providers',
  GET_PROVIDER_DETAILS: 'get_provider_details',
  CHECK_PROVIDER_AVAILABILITY: 'check_provider_availability',
  SUGGEST_APPOINTMENT_SLOTS: 'suggest_appointment_slots',
  BOOK_APPOINTMENT: 'book_appointment',
  HANDOFF_TO_HUMAN: 'handoff_to_human',
  CANCEL_APPOINTMENT: 'cancel_appointment',
  RESCHEDULE_APPOINTMENT: 'reschedule_appointment',
  CONFIRM_APPOINTMENT: 'confirm_appointment',
  GET_PATIENT_APPOINTMENTS: 'get_patient_appointments',
  GET_PATIENT_PACKAGES: 'get_patient_packages',
  REGISTER_LEAD: 'register_lead',
  SEARCH_HOTELS: 'search_hotels',
  BOOK_HOTEL: 'book_hotel',
  GET_HOTEL_BOOKINGS: 'get_hotel_bookings',
  CANCEL_HOTEL_BOOKING: 'cancel_hotel_booking',
  SEARCH_TRANSFERS: 'search_transfers',
  BOOK_TRANSFER: 'book_transfer',
  GET_TRANSFER_BOOKINGS: 'get_transfer_bookings',
  CANCEL_TRANSFER_BOOKING: 'cancel_transfer_booking',
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
      'Klinikteki aktif doktorları uzmanlık alanı (specialty) ve unvanlarıyla (title) listeler. Hasta şikâyetini/durumunu anlattığında, anlattığı duruma en uygun uzmanı bu listeden seç. Doğru providerId için müsaitlik bakmadan veya randevu oluşturmadan önce kullan.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.GET_PROVIDER_DETAILS,
    description:
      'Belirli bir doktorun adını, uzmanlık alanını ve unvanını döner. Eşleştirilen uzmanı hastaya tanıtmak/bilgilendirmek için (randevu öncesi) kullan. providerId list_providers çıktısından gelir.',
    inputSchema: {
      type: 'object',
      properties: {
        providerId: {
          type: 'string',
          description: "Doktorun id'si (list_providers çıktısından).",
        },
      },
      required: ['providerId'],
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
          description: "Doktorun id'si (list_providers çıktısından).",
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
    name: AI_TOOL_NAMES.SUGGEST_APPOINTMENT_SLOTS,
    description:
      'Bir doktorun verilen GÜNDEKİ sunmaya hazır BOŞ randevu saatlerini döner (klinik yerel saatinde, örn. ["14:00","14:30"]). Hastaya saat önermek için check_provider_availability yerine BUNU kullan — boş slot hesabını sen yapma. Önce list_providers ile providerId al.',
    inputSchema: {
      type: 'object',
      properties: {
        providerId: {
          type: 'string',
          description: "Doktorun id'si (list_providers çıktısından).",
        },
        date: {
          type: 'string',
          description: 'Slotların aranacağı gün, klinik yerel tarihi (YYYY-MM-DD).',
        },
        durationMinutes: {
          type: 'number',
          description:
            "Randevu süresi (dakika), 5'in katı. Slot adımı budur. Belirsizse 30.",
        },
      },
      required: ['providerId', 'date', 'durationMinutes'],
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.BOOK_APPOINTMENT,
    description:
      'Hasta için randevu oluşturur. Yalnızca hastadan doktor, tarih/saat ve süre için açık onay aldıktan sonra çağır. Saati önce suggest_appointment_slots ile doğrula. Tarih ve saati KLİNİK YEREL saatiyle ver (UTC çevirme YAPMA; sistem otomatik çevirir).',
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
        date: {
          type: 'string',
          description:
            'Randevu günü, klinik yerel tarihi (YYYY-MM-DD).',
        },
        time: {
          type: 'string',
          description:
            "Randevu başlangıç saati, klinik yerel saati (HH:mm, örn. \"14:30\"). suggest_appointment_slots çıktısındaki bir değer olmalı.",
        },
        durationMinutes: {
          type: 'number',
          description: "Randevu süresi (dakika), 5'in katı. Belirsizse 30.",
        },
      },
      required: [
        'providerId',
        'patientName',
        'date',
        'time',
        'durationMinutes',
      ],
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
  {
    name: AI_TOOL_NAMES.CANCEL_APPOINTMENT,
    description:
      'Yazışmadaki hastanın KENDİ mevcut randevusunu iptal eder. appointmentId için önce get_patient_appointments ile hastanın randevularını listele. Yalnızca bu yazışmaya bağlı hastanın randevuları iptal edilebilir. Randevuya 2 saatten az kaldıysa anında iptal yerine ekibe iptal talebi iletilir. İptal nedenini (reason) hastadan nezaketle öğrenmeye çalış.',
    inputSchema: {
      type: 'object',
      properties: {
        appointmentId: {
          type: 'string',
          description:
            "İptal edilecek randevunun benzersiz ID'si (get_patient_appointments çıktısından).",
        },
        reason: {
          type: 'string',
          description: 'Hastanın randevuyu iptal etme gerekçesi.',
        },
      },
      required: ['appointmentId'],
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.RESCHEDULE_APPOINTMENT,
    description:
      'Yazışmadaki hastanın KENDİ mevcut randevusunu yeni tarih/saate erteler. appointmentId için önce get_patient_appointments kullan; yeni saatin müsaitliğini suggest_appointment_slots ile doğrula. Doktor aynı kalır. Yalnızca bu yazışmaya bağlı hastanın randevusu ertelenebilir. Tarih ve saati KLİNİK YEREL saatiyle ver (UTC çevirme YAPMA).',
    inputSchema: {
      type: 'object',
      properties: {
        appointmentId: {
          type: 'string',
          description:
            "Ertelenecek randevunun benzersiz ID'si (get_patient_appointments çıktısından).",
        },
        newDate: {
          type: 'string',
          description:
            'Yeni randevu günü, klinik yerel tarihi (YYYY-MM-DD).',
        },
        newTime: {
          type: 'string',
          description:
            "Yeni başlangıç saati, klinik yerel saati (HH:mm, örn. \"14:30\"). suggest_appointment_slots çıktısındaki bir değer olmalı.",
        },
        newDurationMinutes: {
          type: 'number',
          description:
            "Yeni süre (dakika), 5'in katı. Belirtilmezse mevcut randevunun süresi korunur.",
        },
      },
      required: ['appointmentId', 'newDate', 'newTime'],
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.CONFIRM_APPOINTMENT,
    description:
      'Yazışmadaki hastanın KENDİ bekleyen (PENDING) randevusunu onaylar (CONFIRMED). Klinik hatırlatma gönderdikten sonra hasta "onaylıyorum / geliyorum / tamam geleceğim" dediğinde kullan. appointmentId için önce get_patient_appointments ile randevuyu bul. Yalnızca bu yazışmaya bağlı hastanın randevusu onaylanabilir; yalnızca bekleyen randevular onaylanabilir.',
    inputSchema: {
      type: 'object',
      properties: {
        appointmentId: {
          type: 'string',
          description:
            "Onaylanacak randevunun benzersiz ID'si (get_patient_appointments çıktısından).",
        },
      },
      required: ['appointmentId'],
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.GET_PATIENT_APPOINTMENTS,
    description:
      'Yazışmadaki hastanın yaklaşan (aktif) randevularını listeler. Hasta randevusunu sorduğunda, unuttuğunda ya da iptal/erteleme için doğru appointmentId gerektiğinde kullan. Telefon/parametre alma; her zaman bu yazışmaya bağlı hastanın randevularını döner. Yazışma bir hasta kaydına bağlı değilse randevu listelenemez.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.GET_PATIENT_PACKAGES,
    description:
      'Yazışmadaki hastanın satın aldığı tedavi paketlerini ve kalan seans sayısını listeler. Hasta "kaç seansım kaldı", "paketimde ne var" gibi sorular sorduğunda kullan. Telefon/parametre alma; her zaman bu yazışmaya bağlı hastanın paketlerini döner. Yazışma bir hasta kaydına bağlı değilse paket listelenemez.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.REGISTER_LEAD,
    description:
      'Yeni bir müşteriyi (lead) sisteme kaydeder. Hasta kayıt olmak/üye olmak istediğinde kullan. ÖNCE adını öğren ve kişisel verilerinin işlenmesine (KVKK) açık onayını al; onay verilmeden çağırma (consent=true ancak hasta açıkça kabul ettiyse). Telefon: WhatsApp\'ta yazdığı numara otomatik kullanılır (phone boş bırak); hasta FARKLI bir numara verdiyse onu phone olarak gönder. Telegram/Instagram\'da numara yazmadıysa phone gerekir.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Müşterinin adı soyadı.',
        },
        phone: {
          type: 'string',
          description:
            'Telefon numarası. WhatsApp\'ta boş bırakılırsa yazışılan (doğrulanmış) numara kullanılır. Hasta farklı bir numara belirttiyse burada gönder.',
        },
        consent: {
          type: 'boolean',
          description:
            'Hasta kişisel verilerinin işlenmesine (KVKK) açıkça onay verdiyse true. Onay yoksa kayıt yapılmaz.',
        },
      },
      required: ['name', 'consent'],
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.SEARCH_HOTELS,
    description:
      'Klinik çevresindeki anlaşmalı otellerde verilen tarihler ve kişi sayısı için müsait oda/fiyat seçeneklerini döner. Hangi otellerin aranacağı klinik ayarından otomatik gelir (sen otel/şehir belirtme). Her seçeneğin kısa bir optionId\'si olur; rezervasyon için book_hotel\'e o optionId\'yi ver. Tarihleri YYYY-MM-DD ver.',
    inputSchema: {
      type: 'object',
      properties: {
        checkIn: {
          type: 'string',
          description: 'Giriş tarihi (YYYY-MM-DD).',
        },
        checkOut: {
          type: 'string',
          description: 'Çıkış tarihi (YYYY-MM-DD).',
        },
        adults: {
          type: 'number',
          description: 'Yetişkin sayısı (en az 1).',
        },
        children: {
          type: 'number',
          description: 'Çocuk sayısı (yoksa 0).',
        },
        rooms: {
          type: 'number',
          description: 'Oda sayısı (belirsizse 1).',
        },
      },
      required: ['checkIn', 'checkOut', 'adults'],
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.BOOK_HOTEL,
    description:
      'Seçilen otel için ÖDEME başlatır ve hastaya gönderilecek İKİ ödeme linki döner: tryLink (TRY, iyzico — Türkiye\'den) ve fxLink (EUR/USD, Stripe — yurt dışından). Rezervasyon ancak ödeme alınınca otomatik oluşur (bu araç rezervasyonu HEMEN oluşturmaz). Yalnızca hastadan açık onay + iptal koşulları onayı aldıktan sonra çağır. optionId search_hotels çıktısından olmalı (~15 dk geçerli). Dönen iki linki de hastaya ilet: Türkiye\'den ödeyecekse TRY linkini, yurt dışından ödeyecekse EUR/USD linkini kullanmasını söyle.',
    inputSchema: {
      type: 'object',
      properties: {
        optionId: {
          type: 'string',
          description: 'Rezerve edilecek otel seçeneği (search_hotels çıktısından).',
        },
        holderName: {
          type: 'string',
          description: 'Rezervasyon sahibinin adı.',
        },
        holderSurname: {
          type: 'string',
          description: 'Rezervasyon sahibinin soyadı.',
        },
      },
      required: ['optionId', 'holderName', 'holderSurname'],
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.GET_HOTEL_BOOKINGS,
    description:
      'Yazışmadaki hastanın/lead\'in mevcut otel rezervasyonlarını listeler. İptal için doğru rezervasyon kimliği (id) gerektiğinde de kullan. Parametre alma; her zaman bu yazışmaya bağlı kişinin rezervasyonlarını döner.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.CANCEL_HOTEL_BOOKING,
    description:
      'Yazışmadaki hastanın/lead\'in KENDİ otel rezervasyonunu iptal eder ve ödemesini otomatik iade başlatır. bookingId için önce get_hotel_bookings ile rezervasyonu bul. Yalnızca bu yazışmaya bağlı kişinin rezervasyonu iptal edilebilir. İptal koşullarına göre ücret doğabileceğini iptal ÖNCESİ hatırlat.',
    inputSchema: {
      type: 'object',
      properties: {
        bookingId: {
          type: 'string',
          description:
            "İptal edilecek rezervasyonun kimliği (get_hotel_bookings çıktısındaki id).",
        },
      },
      required: ['bookingId'],
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.SEARCH_TRANSFERS,
    description:
      'Havalimanı ile klinik arasında transfer (araç) seçeneklerini döner. Nereden/nereye klinik ayarından otomatik gelir; sen yön (geliş/gidiş), tarih, saat ve kişi sayısı sor. ARRIVAL = havalimanından kliniğe (uçuş indikten sonra), DEPARTURE = klinikten havalimanına. Her seçeneğin kısa optionId\'si olur; book_transfer\'e onu ver. Tarih YYYY-MM-DD, saat HH:mm.',
    inputSchema: {
      type: 'object',
      properties: {
        direction: {
          type: 'string',
          enum: ['ARRIVAL', 'DEPARTURE'],
          description:
            'ARRIVAL: havalimanı → klinik. DEPARTURE: klinik → havalimanı.',
        },
        date: {
          type: 'string',
          description:
            'Transfer tarihi (YYYY-MM-DD). ARRIVAL için uçağın iniş tarihi.',
        },
        time: {
          type: 'string',
          description:
            'Transfer saati (HH:mm). ARRIVAL için uçağın iniş saati.',
        },
        adults: {
          type: 'number',
          description: 'Yetişkin sayısı (en az 1).',
        },
        children: {
          type: 'number',
          description: 'Çocuk sayısı (yoksa 0).',
        },
        infants: {
          type: 'number',
          description: 'Bebek sayısı (yoksa 0).',
        },
      },
      required: ['direction', 'date', 'time', 'adults'],
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.BOOK_TRANSFER,
    description:
      'Seçilen transfer için ÖDEME başlatır ve hastaya gönderilecek İKİ ödeme linki döner: tryLink (TRY, iyzico — Türkiye\'den) ve fxLink (EUR/USD, Stripe — yurt dışından). Rezervasyon ancak ödeme alınınca otomatik oluşur (bu araç rezervasyonu HEMEN oluşturmaz). Yalnızca hastadan açık onay + iptal koşulları onayı aldıktan sonra çağır. optionId search_transfers çıktısından gelir (~15 dk geçerli). Uçuş numarası (flightCode), e-posta ve telefon zorunludur. Dönen iki linki de hastaya ilet (Türkiye\'den TRY/iyzico, yurt dışından EUR-USD/Stripe).',
    inputSchema: {
      type: 'object',
      properties: {
        optionId: {
          type: 'string',
          description: 'Rezerve edilecek transfer seçeneği (search_transfers çıktısından).',
        },
        holderName: { type: 'string', description: 'Rezervasyon sahibinin adı.' },
        holderSurname: {
          type: 'string',
          description: 'Rezervasyon sahibinin soyadı.',
        },
        holderEmail: {
          type: 'string',
          description: 'Rezervasyon sahibinin e-posta adresi (zorunlu).',
        },
        holderPhone: {
          type: 'string',
          description: 'Rezervasyon sahibinin telefon numarası (zorunlu).',
        },
        flightCode: {
          type: 'string',
          description:
            'Uçuş numarası (ör. "TK1980"). ARRIVAL için iniş, DEPARTURE için kalkış uçuşu.',
        },
      },
      required: [
        'optionId',
        'holderName',
        'holderSurname',
        'holderEmail',
        'holderPhone',
        'flightCode',
      ],
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.GET_TRANSFER_BOOKINGS,
    description:
      'Yazışmadaki hastanın/lead\'in mevcut transfer rezervasyonlarını listeler. İptal için doğru referans gerektiğinde de kullan. Parametre alma; her zaman bu yazışmaya bağlı kişinin rezervasyonlarını döner.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: AI_TOOL_NAMES.CANCEL_TRANSFER_BOOKING,
    description:
      'Yazışmadaki hastanın/lead\'in KENDİ transfer rezervasyonunu iptal eder ve ödemesini otomatik iade başlatır. reference için önce get_transfer_bookings ile rezervasyonu bul. Yalnızca bu yazışmaya bağlı kişinin rezervasyonu iptal edilebilir. İptal koşullarına göre ücret doğabileceğini iptal ÖNCESİ hatırlat.',
    inputSchema: {
      type: 'object',
      properties: {
        reference: {
          type: 'string',
          description:
            'İptal edilecek transfer rezervasyonunun referansı (get_transfer_bookings çıktısındaki reference).',
        },
      },
      required: ['reference'],
      additionalProperties: false,
    },
  },
];
