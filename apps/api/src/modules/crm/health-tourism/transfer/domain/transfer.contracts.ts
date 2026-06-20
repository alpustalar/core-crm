import { z } from 'zod';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';

// ==========================================
// 1. SORGULAMA SÖZLEŞMELERİ (FILTERS)
// ==========================================

export const FindTransferBookingsFilterSchema = z.object({
  organizationId: z.uuid(),
  clinicId: z.uuid().optional(),
  patientId: z.uuid().optional(),
  leadId: z.uuid().optional(), // Sağlık turizmi CRM potansiyel hasta referansı
});
export type FindTransferBookingsFilter = z.infer<
  typeof FindTransferBookingsFilterSchema
>;

// ==========================================
// 2. REPO VE REZERVASYON SÖZLEŞMELERİ (PROPS)
// ==========================================

export const CreateTransferBookingPropsSchema = z.object({
  id: z.uuid(),
  reference: z.string().min(1, 'Referans kodu zorunludur'), // Tedarikçi rezervasyon kodu
  clientReference: z.string().optional(),
  holderName: z.string().min(1, 'Yolcu adı zorunludur'),
  holderSurname: z.string().min(1, 'Yolcu soyadı zorunludur'),
  holderEmail: z.email('Geçersiz e-posta formatı'),
  holderPhone: z.string().min(1, 'Telefon numarası zorunludur'),

  transfers: z.unknown(), // Ham API response/request objesi için unknown koruması

  totalAmount: z.number().positive("Toplam tutar 0'dan büyük olmalıdır"),
  currency: CurrencySchema,
  remarks: z.string().optional(),

  organizationId: z.uuid(),
  clinicId: z.uuid().optional(),
  patientId: z.uuid().optional(),
  leadId: z.uuid().optional(),
});
export type CreateTransferBookingProps = z.infer<
  typeof CreateTransferBookingPropsSchema
>;

// ==========================================
// 3. ENTEGRASYON VE SEÇENEK SÖZLEŞMELERİ (AVAILABILITY)
// ==========================================

export const TransferAvailabilityItemSchema = z.object({
  id: z.number().int(),
  direction: z.enum(['DEPARTURE', 'ARRIVAL']),
  transferType: z.string(),

  vehicle: z.object({
    code: z.string(),
    name: z.string(),
  }),

  category: z.object({
    code: z.string(),
    name: z.string(),
  }),

  adults: z.number().int().nonnegative(),
  children: z.number().int().nonnegative(),
  infants: z.number().int().nonnegative(),

  price: z.object({
    totalAmount: z.number(),
    netAmount: z.number(),
    currencyId: z.string(),
  }),

  rateKey: z.string(),

  pickupInformation: z.object({
    from: z.object({ code: z.string(), type: z.string() }),
    to: z.object({ code: z.string(), type: z.string() }),
    date: z.string(),
    time: z.string().nullable(),
    pickup: z
      .object({
        checkPickup: z
          .object({
            mustCheckPickupTime: z.boolean(),
            url: z.url().optional(),
            hoursBeforeConsulting: z.number().optional(),
          })
          .optional(),
      })
      .optional(),
  }),

  cancellationPolicies: z.array(
    z.object({
      amount: z.number(),
      from: z.string(), // İptal politikasının geçerlilik tarihi başlangıcı
    })
  ),

  content: z
    .object({
      images: z.array(z.unknown()).optional(),
      transferRemarks: z
        .array(z.object({ type: z.string(), text: z.string() }))
        .optional(),
    })
    .optional(),

  extras: z
    .array(
      z.object({
        code: z.string(),
        name: z.string(),
        type: z.string(),
        price: z.number(),
        minUnits: z.number().int(),
        maxUnits: z.number().int(),
        required: z.boolean(),
      })
    )
    .optional(),
});
export type TransferAvailabilityItem = z.infer<
  typeof TransferAvailabilityItemSchema
>;

// ==========================================
// 1. API İSTEK PARAMETRELERİ SÖZLEŞMELERİ (PARAMS)
// ==========================================

export const TransferAvailabilityParamsSchema = z.object({
  language: z.string().min(2).max(5), // Örn: "tr" veya "en-US"
  fromType: z.string(),
  fromCode: z.string(),
  toType: z.string(),
  toCode: z.string(),
  outboundDate: z.string(), // YYYY-MM-DD formatı
  outboundTime: z.string(), // HH:mm formatı
  adults: z.number().int().nonnegative(),
  children: z.number().int().nonnegative(),
  infants: z.number().int().nonnegative(),
  ages: z.string().optional(), // Örn: "5,12" (çocuk yaşları virgülle ayrılmış)
  returnDate: z.string().optional(),
  returnTime: z.string().optional(),
});
export type TransferAvailabilityFilter = z.infer<
  typeof TransferAvailabilityParamsSchema
>;

// ==========================================
// 2. REZERVASYON GİRDİ SÖZLEŞMELERİ (INPUTS & DETAILS)
// ==========================================

export const TransferDetailSchema = z.object({
  type: z.enum(['FLIGHT', 'CRUISE', 'TRAIN']),
  direction: z.enum(['ARRIVAL', 'DEPARTURE']),
  code: z.string().min(1, 'Uçuş/Sefer kodu veya numarası zorunludur'),
  companyName: z.string().nullable().optional(), // Örn: "THY"
});
export type TransferDetail = z.infer<typeof TransferDetailSchema>;

export const TransferBookingExtraSchema = z.object({
  units: z.string(), // Tedarikçi formatına uygun olarak string (Örn: "1")
  code: z.string(), // Ekstra hizmet kodu (Örn: "BABY_SEAT")
});
export type TransferBookingExtra = z.infer<typeof TransferBookingExtraSchema>;

export const TransferPickupInformationSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  town: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
});
export type TransferPickupInformation = z.infer<
  typeof TransferPickupInformationSchema
>;

export const TransferBookingInputSchema = z.object({
  rateKey: z.string().min(1, 'Rate key zorunludur'),
  transferDetails: z
    .array(TransferDetailSchema)
    .min(1, 'En az bir transfer detayı (uçuş vb.) girilmelidir'),
  extras: z.array(TransferBookingExtraSchema).optional(),
  pickupInformation: TransferPickupInformationSchema.optional(),
});
export type TransferBookingInput = z.infer<typeof TransferBookingInputSchema>;

export const CreateTransferBookingParamsSchema = z.object({
  language: z.string(),
  holder: z.object({
    name: z.string().min(1, 'Yolcu adı boş olamaz'),
    surname: z.string().min(1, 'Yolcu soyadı boş olamaz'),
    email: z.string().email('Geçersiz e-posta formatı'),
    phone: z.string().min(1, 'Telefon numarası boş olamaz'),
  }),
  transfers: z
    .array(TransferBookingInputSchema)
    .min(1, 'Rezervasyon için en az bir transfer seçilmelidir'),
  clientReference: z.string().optional(),
  welcomeMessage: z.string().optional(),
  remark: z.string().optional(),
});
export type CreateTransferBookingData = z.infer<
  typeof CreateTransferBookingParamsSchema
>;

// ==========================================
// 3. API GERİ DÖNÜŞ SÖZLEŞMELERİ (RESULTS)
// ==========================================

export const TransferBookingResultSchema = z.object({
  reference: z.string(), // Tedarikçiden dönen pnr / rezervasyon numarası
  creationDate: z.string(),
  status: z.string(), // CONFIRMED, PENDING vb.
  holder: z.object({
    name: z.string(),
    surname: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
  transfers: z.array(z.unknown()), // Ham transfer sonuç objeleri için dizi zırhı
  totalAmount: z.number(),
  currency: z.string(),
  supplier: z
    .object({
      name: z.string(),
    })
    .optional(),
});
export type TransferBookingResult = z.infer<typeof TransferBookingResultSchema>;

export const CancelTransferBookingResultSchema = z.object({
  reference: z.string(),
  status: z.string(), // CANCELLED
  cancellationAmount: z.number().nonnegative(), // İptal ceza tutarı (0 veya daha fazla)
});
export type CancelTransferBookingResult = z.infer<
  typeof CancelTransferBookingResultSchema
>;
