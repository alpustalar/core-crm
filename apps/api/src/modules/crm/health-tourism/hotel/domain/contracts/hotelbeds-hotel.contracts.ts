import { z } from 'zod';

// ==========================================
// HOTELBEDS HOTEL OLUŞTURMA SÖZLEŞMESİ (PROPS)
// ==========================================

export const CreateHotelbedsHotelPropsSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1, 'Otel adı zorunludur'),

  // Hotelbeds tarafından atanan kodlar
  categoryCode: z.string().min(1, 'Kategori kodu zorunludur'),
  categoryName: z.string().nullable().optional(),
  destinationCode: z.string().min(1, 'Destinasyon kodu zorunludur'),
  destinationName: z.string().nullable().optional(),

  // Konum ve Adres
  address: z.string().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),

  // JSON Yapıları (Esnek veri yönetimi)
  images: z.json().nullable().optional(),
  phones: z.json().nullable().optional(),
});

export type CreateHotelbedsHotelProps = z.infer<
  typeof CreateHotelbedsHotelPropsSchema
>;

export const UpsertHotelbedsHotelInputSchema = z.object({
  // Hotelbeds tarafındaki ID veya kod (Genellikle string veya sayısal string olur)
  id: z.string().min(1, 'Otel ID boş olamaz').trim(),
  name: z.string().min(1, 'Otel ismi boş olamaz').trim(),

  categoryCode: z.string().min(1, 'Kategori kodu zorunludur'),
  categoryName: z.string().nullable().optional(),

  destinationCode: z.string().min(1, 'Destinasyon kodu zorunludur'),
  destinationName: z.string().nullable().optional(),

  address: z.string().nullable().optional(),

  latitude: z
    .number()
    .min(-90)
    .max(90, 'Geçersiz enlem (latitude) değeri')
    .nullable()
    .optional(),
  longitude: z
    .number()
    .min(-180)
    .max(180, 'Geçersiz boylam (longitude) değeri')
    .nullable()
    .optional(),

  // Esnek JSON alanları için daha spesifik şemalar yazılabilir, şimdilik any/unknown güvenliği
  images: z.unknown().optional(),
  phones: z.unknown().optional(),

  lastSyncedAt: z.date(),
});

export type UpsertHotelbedsHotelInput = z.infer<
  typeof UpsertHotelbedsHotelInputSchema
>;
