export interface StockLevel {
  productId: string;
  productName: string;
  stockCode: string;
  clinicId: string;
  totalQuantity: string;
  criticalStockQty: string;
  isBelowCritical: boolean;
}
