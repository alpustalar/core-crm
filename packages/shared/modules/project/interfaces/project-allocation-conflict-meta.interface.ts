/**
 * Kapasite çakışması hata gövdesi. Frontend "kaynak dolu" uyarısında hangi
 * projelerin doldurduğunu listeleyebilsin diye çakışan tahsisler taşınır.
 */
export interface ProjectAllocationConflictMeta {
  kind: string;
  resourceId: string;
  requestedPercent: number;
  /** Çakışan aralıktaki mevcut toplam tahsis yüzdesi. */
  allocatedPercent: number;
  conflicts: {
    allocationId: string;
    projectId: string;
    startDate: Date;
    endDate: Date;
    allocationPercent: number;
  }[];
}
