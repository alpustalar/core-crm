// ==========================================
// SORGULAMA SÖZLEŞMELERİ (FILTERS)
// ==========================================

export interface FindTransferBookingsFilter {
  organizationId: string;
  clinicId?: string;
  patientId?: string;
  leadId?: string; // Sağlık turizmi CRM potansiyel hasta referansı
}

// ==========================================
// AI RATE-OPTION TOKEN (kısa optionId → HotelBeds transfer bağlamı)
// ==========================================

/**
 * `search_transfers`'in cache'e yazdığı, `book_transfer`'in optionId ile çözdüğü bağlam.
 * AI kısa bir optionId sunar; gerçek rateKey + yön/fiyat burada saklanır.
 */
export interface TransferRateOptionToken {
  rateKey: string;
  direction: 'ARRIVAL' | 'DEPARTURE';
  vehicleName: string;
  categoryName: string;
  totalAmount: number;
  currency: string;
  fromCode: string;
  toCode: string;
}
