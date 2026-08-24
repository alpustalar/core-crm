import { JsonValueType } from '@input-type-schemas/JsonValueSchema';

// ==========================================
// HOTELBEDS HOTEL OLUŞTURMA SÖZLEŞMESİ (PROPS)
// ==========================================

export interface CreateHotelbedsHotelProps {
  id?: string;
  name: string;

  // Hotelbeds tarafından atanan kodlar
  categoryCode: string;
  categoryName?: string | null;
  destinationCode: string;
  destinationName?: string | null;

  // Konum ve Adres
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  // JSON Yapıları (Esnek veri yönetimi)
  images?: JsonValueType | null;
  phones?: JsonValueType | null;
}

/** HotelBeds katalog senkronizasyonu — upsert girişi (infrastructure/repository katmanına gider). */
export interface UpsertHotelbedsHotelInput {
  // Hotelbeds tarafındaki ID veya kod (Genellikle string veya sayısal string olur)
  id: string;
  name: string;

  categoryCode: string;
  categoryName?: string | null;

  destinationCode: string;
  destinationName?: string | null;

  address?: string | null;

  latitude?: number | null;
  longitude?: number | null;

  images?: unknown;
  phones?: unknown;

  lastSyncedAt: Date;
}
