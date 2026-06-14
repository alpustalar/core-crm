import { QueryResponse } from '@shared/common/response/response.interface';

/** Yaşlandırma kovası — açık taksitlerin vade yaşına göre dağılımı. */
export interface ArAgingBucket {
  label: ArAgingBucketLabel;
  count: number;
  amount: string;
}

export type ArAgingBucketLabel =
  | 'NOT_DUE' // vadesi gelmemiş
  | 'D0_30' // 0-30 gün gecikmiş
  | 'D31_60'
  | 'D61_90'
  | 'D90_PLUS';

/** Hasta bazlı açık taksit riski (ad çözümü çağırana ait — bounded context). */
export interface ArAgingPatientRisk {
  patientId: string;
  outstanding: string; // toplam açık tutar
  overdue: string; // vadesi geçmiş açık tutar
  oldestDueDate: Date | null; // en eski açık vade
}

export interface ArAgingSummary {
  totalOutstanding: string; // açık (PENDING/OVERDUE) toplam
  totalOverdue: string; // vadesi geçmiş açık toplam
  totalCollected: string; // tahsil edilmiş (COMPLETED) toplam
  collectionRate: string; // tahsilat / (tahsilat + açık), 0..1
}

export interface ArAgingReport {
  clinicId: string;
  asOf: Date;
  buckets: ArAgingBucket[];
  patients: ArAgingPatientRisk[]; // overdue azalan sırada
  summary: ArAgingSummary;
}

export type GetArAgingResponse = QueryResponse<ArAgingReport>;
