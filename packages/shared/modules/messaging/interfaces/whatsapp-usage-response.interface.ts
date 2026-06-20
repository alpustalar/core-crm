export interface WhatsappUsageCategoryCount {
  /** marketing | utility | authentication | service (null = kategorisiz) */
  category: string | null;
  count: number;
}

/** Bir dönemde faturalanabilir WhatsApp konuşmalarının kategori kırılımı (maliyet). */
export interface WhatsappUsageView {
  from: Date;
  to: Date;
  totalBillable: number;
  byCategory: WhatsappUsageCategoryCount[];
}
