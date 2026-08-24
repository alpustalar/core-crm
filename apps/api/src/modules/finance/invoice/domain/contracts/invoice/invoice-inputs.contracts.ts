import type { InvoiceStatusType } from '@input-type-schemas/InvoiceStatusSchema';
import type { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { InvoiceTriggers } from '@modules/finance/invoice/domain/constants/invoice-triggers';
import { Decimal } from 'decimal.js';
import { LogSource } from '@src/domain/constants/log-action.constant';
import type { EDocumentTypeType } from '@input-type-schemas/EDocumentTypeSchema';
import type { EDocumentStatusType } from '@input-type-schemas/EDocumentStatusSchema';

export type InvoiceTrigger =
  (typeof InvoiceTriggers)[keyof typeof InvoiceTriggers];

// ==========================================
// 2. INVOICE (FATURA) SÖZLEŞMELERİ
// ==========================================

export interface CreateInvoiceProps {
  id: string;
  organizationId: string;
  clinicId: string;
  patientId: string;
  appointmentId: string | null;
  paymentId: string | null;

  amount: number;
  currency: CurrencyType;
  vatRate: number;

  // Decimal türündeki mali hassas alanlar (CLAUDE.md — Value Object direkt tip):
  netTotal: Decimal;
  vatTotal: Decimal;

  status: InvoiceStatusType;

  invoiceNumber?: string;
  issuedAt?: Date;
  providerRef?: string;
  rawResponse?: unknown;
}

// ==========================================
// FATURA İŞLEM SÖZLEŞMELERİ
// ==========================================

// 1. FATURA DÜZENLEME SÖZLEŞMESİ
export interface IssueInvoiceEntityProps {
  invoiceNumber: string;
  providerRef: string; // Örn: Vergi dairesi veya e-fatura servis referansı
  issuedAt: Date;
  rawResponse?: unknown; // Servisten dönen ham veri (debug amaçlı)
  source?: LogSource;
  actorId?: string;
}

// 2. FATURA İŞLEM HATASI SÖZLEŞMESİ
export interface FailInvoiceEntityProps {
  reason: string;
  source?: LogSource;
  actorId?: string;
}

// 3. E-BELGE SONUÇ SÖZLEŞMESİ
export interface ApplyEDocumentResultProps {
  documentType: EDocumentTypeType;
  uuid: string | null; // E-belge merkezi (GİB) tarafından üretilen evrensel ID
  status: EDocumentStatusType;
  invoiceNumber?: string | null;
}
