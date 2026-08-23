-- CreateEnum
CREATE TYPE "PurchaseOrderBillingStatus" AS ENUM ('NOT_BILLED', 'PARTIALLY_BILLED', 'FULLY_BILLED');

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN     "billing_status" "PurchaseOrderBillingStatus" NOT NULL DEFAULT 'NOT_BILLED',
ADD COLUMN     "invoiced_total" DECIMAL(14,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "purchase_invoices" ADD COLUMN     "purchase_order_id" TEXT;

-- CreateIndex
CREATE INDEX "purchase_orders_clinic_id_billing_status_idx" ON "purchase_orders"("clinic_id", "billing_status");

-- CreateIndex
CREATE INDEX "purchase_invoices_purchase_order_id_idx" ON "purchase_invoices"("purchase_order_id");
