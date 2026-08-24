import { AccountTypeType as AccountType } from '@input-type-schemas/AccountTypeSchema';
import { AccountSideType as AccountSide } from '@input-type-schemas/AccountSideSchema';

// ==========================================
// ACCOUNT (HESAP PLANI) SÖZLEŞMELERİ
// ==========================================

export interface CreateAccountProps {
  id?: string;
  clinicId: string;
  organizationId: string;
  code: string; // Örn: "100.01.001" — format AccountCode VO'da doğrulanır
  name: string; // Örn: "Kasa Hesabı" — boş olamaz, Name VO'da doğrulanır
  parentId?: string | null;

  type: AccountType;
  normalSide: AccountSide; // Borç/Alacak (Debit/Credit) çalışma yönü

  isPostable?: boolean;
  requiresParty?: boolean;
  currency?: string | null;
  isActive?: boolean;
}

export interface CreateChildAccountProps {
  parentId: string; // Çocuk hesap oluşturmak için zorunlu

  clinicId: string;
  organizationId: string;
  code: string;
  name: string;

  // Tip ve NormalSide, ana hesaptan miras alınacağı için opsiyonel bırakılabilir
  // veya metod içinde ana hesaptan otomatik doldurulabilir.
  type?: AccountType;
  normalSide?: AccountSide;

  isPostable?: boolean;
  requiresParty?: boolean;
  currency?: string | null;
  isActive?: boolean;
}
