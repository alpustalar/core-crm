export type SubMerchantType =
  | 'PERSONAL'
  | 'PRIVATE_COMPANY'
  | 'LIMITED_OR_JOINT_STOCK_COMPANY';

export interface CreateSubMerchantRequest {
  conversationId: string;
  subMerchantExternalId: string;
  subMerchantType: SubMerchantType;
  address: string;
  taxOffice?: string;
  legalCompanyTitle?: string;
  email: string;
  gsmNumber: string;
  name: string;
  iban: string;
  identityNumber: string;
}

export interface UpdateSubMerchantRequest extends CreateSubMerchantRequest {
  subMerchantKey: string;
}

export interface SubMerchantResult {
  subMerchantKey: string;
}
