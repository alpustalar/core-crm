import { EDocumentTypeType as EDocumentType } from '@input-type-schemas/EDocumentTypeSchema';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

/** Satıcı/alıcı vergi kimliği (e-belge zarfı için). */
export interface PartyTaxInfo {
  taxId: string | null; // VKN veya TCKN
  name: string;
  isEInvoiceUser?: boolean;
  alias?: string | null; // e-Fatura posta kutusu etiketi
}

export interface EDocumentLine {
  name: string;
  quantity: number;
  unitPrice: string;
  vatRate: number;
  vatAmount: string;
  withholdingAmount?: string;
}

export interface EDocumentTotals {
  net: string;
  vat: string;
  withholding?: string;
  payable: string;
}

/** Çekirdeğin porta geçtiği belge isteği (doc 07 §3). Adapter'a özgü değildir. */
export interface EDocumentRequest {
  type: EDocumentType;
  invoiceId: string;
  issueDate: Date;
  seller: PartyTaxInfo;
  buyer: PartyTaxInfo;
  lines: EDocumentLine[];
  totals: EDocumentTotals;
  currency: CurrencyType;
  note?: string;
}
