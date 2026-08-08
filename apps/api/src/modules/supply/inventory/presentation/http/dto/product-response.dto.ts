import { Expose, Type } from 'class-transformer';
import { ResponseGroups } from '@common/constants/response-groups.constant';
import { ProductUnitType } from '@input-type-schemas/ProductUnitSchema';
import { ProductConditionType } from '@input-type-schemas/ProductConditionSchema';

const { MANAGEMENT, ADMIN, FINANCIAL } = ResponseGroups;

export class ProductResponseDto {
  // --- Çekirdek Kimlik Bilgileri ---
  @Expose() id: string;
  @Expose() stockCode: string;
  @Expose() barcode: string | null;

  // --- Genel Ürün Tanım Bilgileri (Tüm Roller & UI Tüketimi) ---
  @Expose() name: string;
  @Expose() brand: string | null;
  @Expose() description: string | null;
  @Expose() imageUrl: string | null;
  @Expose() unit: ProductUnitType;
  @Expose() condition: ProductConditionType | null;
  @Expose() isActive: boolean;

  // --- İlişkisel ID Bilgileri ---
  @Expose() categoryId: string | null;
  @Expose() supplierId: string | null;
  @Expose() clinicId: string;

  // --- Finansal ve Hassas Stok Bilgileri (Üst Roller / İç Operasyon) ---
  @Expose()
  vatRate: number;

  @Expose({ groups: [MANAGEMENT, FINANCIAL, ADMIN] })
  @Type(() => String) // Decimal hassasiyetini korumak için string'e cast ediyoruz
  criticalStockQty: string;

  @Expose({ groups: [MANAGEMENT, FINANCIAL, ADMIN] })
  @Type(() => String)
  reorderQty: string;

  @Expose({ groups: [ADMIN] })
  organizationId: string;

  // --- Audit Zaman Damgaları ---
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  @Expose({ groups: [ADMIN] })
  deletedAt: Date | null;
}
