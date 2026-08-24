import { Decimal } from 'decimal.js';

/** Plan katalog okuma modeli — plan + içerdiği modüller (düz shape). */
export interface PlanReadModel {
  id: string;
  planId: string;
  name: string;
  monthlyPrice: Decimal;
  currency: string;
  isActive: boolean;
  modules: { id: string; key: string; name: string }[];
}
