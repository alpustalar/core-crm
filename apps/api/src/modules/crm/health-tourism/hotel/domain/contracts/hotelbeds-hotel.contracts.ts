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
