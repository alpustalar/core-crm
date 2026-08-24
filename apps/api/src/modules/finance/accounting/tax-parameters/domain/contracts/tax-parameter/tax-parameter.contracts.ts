import { TaxParameterKeyType as TaxParameterKey } from '@input-type-schemas/TaxParameterKeySchema';

// ==========================================
// 1. REPO VE ENTITY SEVİYESİ SÖZLEŞMELERİ (PROPS)
// ==========================================

export interface CreateTaxParameterProps {
  id?: string;
  clinicId: string;
  organizationId: string;
  key: TaxParameterKey; // Orijinal enum/tip şeması (Örn: VAT_20, STOPPAJ_20)
  rate: number; // 0-100 aralığı — TaxParameter.create() içinde doğrulanır
  validFrom: Date;
  validTo?: Date | null;
}

// ==========================================
// 2. UYGULAMA / COMMAND SEVİYESİ SÖZLEŞMELERİ (INPUT)
// ==========================================

export interface SetTaxParameterInput {
  clinicId: string;
  organizationId: string;
  key: TaxParameterKey;
  rate: number; // 0-100 aralığı — TaxParameter.create() içinde doğrulanır
  validFrom?: Date; // Verilmezse command handler içinde 'DateTimeManager.create()' atanabilir
}
