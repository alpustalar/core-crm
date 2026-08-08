import { z } from 'zod';
import {
  Appointment,
  AppointmentSchema,
  Clinic,
  Pagination,
  Patient,
  Provider,
  TimeZoneSchema,
  Treatment,
  User,
} from '@shared';
import { AppointmentStatusSchema } from '@input-type-schemas/AppointmentStatusSchema';
import { ExaminationTypeType as ExaminationType } from '@input-type-schemas/ExaminationTypeSchema';
import { VisitTypeType as VisitType } from '@input-type-schemas/VisitTypeSchema';
import { ResponseGroups } from '@common/constants/response-groups.constant';

export const CreateAppointmentSchema = AppointmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
  .partial()
  .extend({
    id: z.uuid().optional(),
    providerId: z.uuid(),
    clinicId: z.uuid(),
    patientId: z.uuid(),
    startTime: z.date(),
    endTime: z.date().optional(),
    patientName: z.string(),
    patientPhone: z.string(),
    patientEmail: z.email().nullable().optional(),
    duration: z.number().optional(),
    timezone: TimeZoneSchema,
    treatmentType: z.string().nullable().optional(),
    isConsultation: z.boolean(),
  });

export type CreateAppointmentProps = z.infer<typeof CreateAppointmentSchema>;

export type IAppointmentEntity = z.infer<typeof AppointmentSchema>;

// ==========================================
// REPO SORGULARI VE YARDIMCI TİPLER
// ==========================================

export type AppointmentWithDetails = Appointment & {
  patient: Patient | null;
  provider: (Provider & { user: User }) | null;
  treatment: Treatment | null;
  clinic: Clinic | null;
};

export type FindByOrganizationIdData = {
  organizationId: string;
  pagination: Pagination;
  clinicId?: string;
  status?: z.infer<typeof AppointmentStatusSchema>;
  startDate?: Date;
  endDate?: Date;
};

export type FindClinicCalendarData = {
  clinicId: string;
  startDate: Date;
  endDate: Date;
  pagination: Pagination;
  /** Verilirse yalnız bu doktorun randevuları. */
  providerId?: string;
  /** Verilirse yalnız bu durumdaki randevular (ör. NOSHOW, CANCELLED). */
  status?: z.infer<typeof AppointmentStatusSchema>;
};

// ==========================================
// TAM TAKVİM (sayfasız) — klinik + opsiyonel doktor filtresi
// ==========================================

/** Tam takvim sorgusunun repo filtresi. Sayfalama YOK — tarih aralığıyla sınırlıdır. */
export type FindClinicCalendarEventsData = {
  clinicId: string;
  startDate: Date;
  endDate: Date;
  /** Verilirse yalnız bu doktorun randevuları. */
  providerId?: string;
  /** Verilirse yalnız bu durumdaki randevular (ör. NOSHOW, CANCELLED). */
  status?: z.infer<typeof AppointmentStatusSchema>;
};

/** Repo'nun döndürdüğü ham takvim projeksiyonu (doktor adı henüz yok — handler zenginleştirir). */
export type ClinicCalendarEventRow = {
  id: string;
  providerId: string;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  startTime: Date;
  endTime: Date;
  status: z.infer<typeof AppointmentStatusSchema>;
  treatmentType: string | null;
  isConsultation: boolean;
};

/** Takvim olayı okuma-modeli (doktor adı zenginleştirilmiş). Entity DEĞİL. */
export interface ClinicCalendarEvent {
  appointmentId: string;
  providerId: string;
  providerName: string | null;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  startTime: Date;
  endTime: Date;
  status: z.infer<typeof AppointmentStatusSchema>;
  treatmentType: string | null;
  isConsultation: boolean;
}

/** Bir güne ait (klinik yerelinde) tüm randevular. */
export interface ClinicCalendarDay {
  date: string; // 'YYYY-MM-DD'
  events: ClinicCalendarEvent[];
}

// ==========================================
// RESEPSİYON — arama, hatırlatma, günlük özet
// ==========================================

/** Klinik geneli randevu arama filtresi (ad/telefon + opsiyonel status/doktor/tarih). */
export type SearchClinicAppointmentsData = {
  clinicId: string;
  pagination: Pagination;
  /** Hasta adı veya telefonunda geçen serbest metin. */
  search?: string;
  status?: z.infer<typeof AppointmentStatusSchema>;
  providerId?: string;
  startDate?: Date;
  endDate?: Date;
};

/** Yaklaşan hatırlatma (onaylı, hoursAhead içi) sorgusunun klinik-kapsamlı filtresi. */
export type FindUpcomingRemindersData = {
  clinicId: string;
  pagination: Pagination;
  /** Şu andan itibaren kaç saat ilerisi taranır (varsayılan handler'da). */
  hoursAhead?: number;
};

/** Günlük özet sayımının repo filtresi — gün sınırları klinik yerelinde hazırlanır. */
export type FindClinicDailyCountsData = {
  clinicId: string;
  /** Verilirse yalnız bu doktor. */
  providerId?: string;
  dayStart: Date;
  dayEnd: Date;
};

/** groupBy(status) ham çıktısı — handler düz özete katlar. */
export type ClinicStatusCount = {
  status: z.infer<typeof AppointmentStatusSchema>;
  count: number;
};

/** Klinik günlük randevu özeti okuma-modeli (status bazlı sayımlar). */
export interface ClinicDailySummary {
  /** Klinik yerel tarihi (YYYY-MM-DD). */
  date: string;
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  noShow: number;
}

// ==========================================
// RESEPSİYON — detay düzenleme, çakışma görünürlüğü, doktor-günü toplu iptal
// ==========================================

/**
 * Randevu detay güncelleme girişi (entity.updateDetails). Sadece verilen alanlar
 * güncellenir; undefined = dokunma, null = temizle (nullable alanlarda). Zaman/doktor/
 * durum burada DEĞİL.
 */
export type UpdateAppointmentDetailsProps = {
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string | null;
  notes?: string | null;
  treatmentType?: string | null;
  treatmentId?: string | null;
  examinationType?: ExaminationType | null;
  visitType?: VisitType | null;
};

/** Çakışma görünürlüğü okuma-modeli — çakışan randevunun personele gösterilecek özeti. */
export interface ConflictingAppointmentView {
  id: string;
  patientName: string;
  startTime: Date;
  endTime: Date;
  status: z.infer<typeof AppointmentStatusSchema>;
}

/** Doktor-günü toplu iptal repo filtresi. Yalnız iptal edilebilir statüler güncellenir. */
export type CancelProviderAppointmentsData = {
  providerId: string;
  clinicId: string;
  startDate: Date;
  endDate: Date;
  canceledBy: string;
  cancelReason?: string;
};

// ==========================================
// BEKLEME ODASI (check-in / ARRIVED)
// ==========================================

/** Bekleme odası repo filtresi — kliniğe gelmiş (ARRIVED) hastalar. */
export type FindWaitingRoomData = {
  clinicId: string;
  providerId?: string;
};

/** Repo'nun döndürdüğü ham bekleme-odası projeksiyonu (doktor adı henüz yok). */
export type WaitingRoomRow = {
  id: string;
  providerId: string;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  startTime: Date;
  checkedInAt: Date | null;
  treatmentType: string | null;
};

/** Bekleme odası okuma-modeli (doktor adı zenginleştirilmiş). Entity DEĞİL. */
export interface WaitingRoomEntry {
  appointmentId: string;
  providerId: string;
  providerName: string | null;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  startTime: Date;
  checkedInAt: Date | null;
  treatmentType: string | null;
}

// ==========================================
// HATIRLATMA TARAMASI (reminder scan)
// ==========================================

/**
 * Hatırlatma taraması repo filtresi — [now, windowEnd] aralığında başlayan,
 * CONFIRMED + reminderSentAt=null randevular. Klinik-başına saat penceresi
 * handler'da uygulanır; `limit` tarama parti boyutunu sınırlar.
 */
export type FindDueForReminderData = {
  now: Date;
  windowEnd: Date;
  limit: number;
};

// Çakışma ve Rezervasyon Kontrol Tipleri
export type FindConflictingAppointmentData = {
  providerId: string;
  startTime: Date;
  endTime: Date;
  ignoreAppointmentId?: string;
};

export type CheckConflictProps = {
  providerId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  ignoreAppointmentId?: string;
};

export type ConflictingAppointment = {
  id: string;
  startTime: Date;
  endTime: Date;
};

export interface OccupiedSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  status: z.infer<typeof AppointmentStatusSchema>;
}

export interface ProviderDailyLoad {
  providerId: string;
  date: Date;
  appointmentCount: number;
}

// Açık slot önerisi (AI asistanı) — yerel tarih bazında hazır boş slotlar
export interface FindProviderOpenSlotsInput {
  providerId: string;
  clinicId: string;
  /** Klinik yerel saatinde gün (YYYY-MM-DD). */
  date: string;
  /** Randevu süresi (dakika); slot adımı bu değerdir. */
  durationMinutes: number;
}

export interface OpenSlot {
  /** Klinik yerel saatinde başlangıç etiketi (HH:mm) — hastaya sunmaya hazır. */
  time: string;
  /** Tam UTC anı — booking doğrudan bunu kullanabilir. */
  start: Date;
  durationMinutes: number;
}

/**
 * Klinik geneli açık slot okuma-modeli: hangi doktorun hangi anında boşluk olduğu.
 * `GetClinicOpenSlotsQuery` çıktısıdır; entity değil, HTTP/bus sınırını güvenle geçer.
 */
export interface ClinicOpenSlot {
  providerId: string;
  providerName: string;
  /** Klinik yerel saatinde başlangıç etiketi (HH:mm). */
  time: string;
  /** Tam UTC anı — booking doğrudan bunu kullanabilir. */
  start: Date;
  /** Tam UTC anı — slot bitişi. */
  end: Date;
  durationMinutes: number;
}

/** Bir güne ait (klinik yerelinde) tüm doktorların açık slotları. */
export interface ClinicOpenSlotsDay {
  /** Klinik yerel tarihi (YYYY-MM-DD). */
  date: string;
  slots: ClinicOpenSlot[];
}

// Aksiyon / State Değişim Tipleri
export interface CancelAppointmentProps {
  canceledBy: NonNullable<string>;
  cancelReason?: string;
}

export type RescheduleAppointmentProps = {
  startTime: Date;
  endTime: Date;
  providerId: string;
  notes?: string;
  treatmentId?: string;
};

// Hasta (Patient) erteleme girişi — klinik ayarındaki (ClinicAppointmentSettings)
// erteleme saat sınırı entity'ye handler tarafından geçirilir.
export type RescheduleByPatientProps = RescheduleAppointmentProps & {
  rescheduleLimitHours: number;
};

export type FindProviderCalendarData = {
  providerId: string;
  startDate: Date;
  endDate: Date;
  pagination: Pagination;
};

// eslint-disable-next-line
const { DATA_OWNER, ...Groups } = ResponseGroups;
export const AppointmentsResponseGroups = {
  ...Groups,
  PROVIDER_DATA_OWNER: 'PROVIDER_DATA_OWNER',
  PATIENT_DATA_OWNER: 'PATIENT_DATA_OWNER',
} as const;

export type AppointmentResponseGroup =
  (typeof AppointmentsResponseGroups)[keyof typeof AppointmentsResponseGroups];

export const CreateCancellationPropsSchema = z.object({
  canceledBy: z.uuid().nullable().optional(),
  reason: z.string().nullable().optional(),
});

export type CreateCancellationProps = z.infer<
  typeof CreateCancellationPropsSchema
>;

export const RescheduleRequestSchema = z
  .object({
    startTime: z.date(),
    endTime: z.date(),
    providerId: z.uuid('Provider ID geçerli bir UUID olmalıdır'),
    notes: z.string().max(1000, 'Notlar 1000 karakteri geçemez').optional(),
    treatmentId: z.uuid().nullable().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'Bitiş zamanı, başlangıç zamanından sonra olmalıdır',
    path: ['endTime'],
  });

export type RescheduleRequestProps = z.infer<typeof RescheduleRequestSchema>;

export const CalculateEndTimeSchema = z
  .object({
    // 🚀 Gelen string tarihi güvenli bir şekilde JavaScript Date nesnesine zorluyoruz (coerce)
    startTime: z.coerce.date(),

    // 🚀 Bitiş tarihi opsiyonel olabilir (çünkü zaten hesaplamak isteyebiliriz) veya gönderilebilir
    endTime: z.coerce.date().nullable().optional(),

    // 🚀 Süreyi sayıya zorluyoruz ve negatif olamayacağını garanti ediyoruz
    duration: z.coerce
      .number()
      .positive("Süre 0'dan büyük olmalıdır.")
      .int('Süre tam sayı olmalıdır.')
      .optional()
      .nullable(),
  })
  // 🛡️ Mantıksal İş Kuralı Kontrolü (Refine)
  .refine(
    (data) => {
      if (data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: 'Bitiş tarihi, başlangıç tarihinden önce veya eşit olamaz.',
      path: ['endTime'], // Hatanın hangi field'a yazılacağını belirliyoruz
    }
  );

export type CalculateEndTimeProps = z.infer<typeof CalculateEndTimeSchema>;

export const CancelScheduleSchema = z.object({
  canceledBy: z.string(),
  reason: z.string().optional(),
});

export type CancelScheduleProps = z.infer<typeof CancelScheduleSchema>;

/**
 * Randevu iş kurallarının (AppointmentRules) ihtiyaç duyduğu asgari veri. Kural
 * sınıfı entity'ye değil bu düz snapshot'a bağlıdır; böylece aynı kurallar hem
 * command tarafında (entity üzerinden) hem okuma tarafında (read-model üzerinden,
 * entity hydrate etmeden) çalıştırılabilir.
 */
export const AppointmentRuleSnapshotSchema = z.object({
  id: z.uuid(),
  status: AppointmentStatusSchema,
});

export type AppointmentRuleSnapshot = z.infer<
  typeof AppointmentRuleSnapshotSchema
>;
