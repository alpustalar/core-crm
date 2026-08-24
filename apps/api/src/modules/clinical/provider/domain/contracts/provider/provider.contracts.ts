import { OperationModeType as OperationMode } from '@input-type-schemas/OperationModeSchema';
import type { UpdateProviderInfo } from '@shared/modules/provider/types/update-provider-info.type';

/**
 * `isActive`/`acceptsConsultation`/`operationMode` zorunlu (opsiyonel değil):
 * eski Zod şeması bu alanları `.default(...)` ile tanımlıyordu ve `z.infer`
 * default'lu alanları OUTPUT tipinde her zaman dolu (zorunlu) sayar — bu yüzden
 * `Provider.create()` bu alanlara fallback koymadan doğrudan erişiyordu. Aynı
 * sözleşme burada da korunuyor (Direct Mapping).
 */
export interface CreateProviderProps {
  id?: string;
  userId: string;
  clinicId: string;
  providerTitleId?: string;
  providerSpecialtyId?: string;
  sectorId?: string;
  publicPhone?: string;
  publicEmail?: string;
  isActive: boolean;
  acceptsConsultation: boolean;
  operationMode: OperationMode;
}

export type FindScheduleProps = {
  providerId: string;
  startDate: Date;
  endDate: Date;
};

export type ProviderCanBookOrThrowProps = {
  providerId: string;
  startTime: Date;
  endTime: Date;
};

/**
 * Read-model: bir kliniğin aktif provider'larını uzmanlık + unvan adlarıyla
 * (çeviriden çözülmüş, tek dil) döndürür. AI asistanının hastanın derdine göre
 * doğru uzmanı seçmesi ve uzman bilgisi vermesi için kullanılır. Entity değil,
 * projeksiyondur.
 */
export type ProviderDirectoryEntry = {
  providerId: string;
  name: string;
  specialty: string | null;
  title: string | null;
  isActive: boolean;
};

/** `@shared` HTTP sınırı tipiyle birebir aynı — domain katmanında ikinci bir tanım açılmaz. */
export type UpdateProviderProps = UpdateProviderInfo;
