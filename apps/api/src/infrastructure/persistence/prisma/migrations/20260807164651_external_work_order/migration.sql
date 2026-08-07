-- CreateEnum
CREATE TYPE "ExternalWorkOrderStatus" AS ENUM ('DRAFT', 'SENT', 'IN_PROGRESS', 'TRY_IN', 'READY', 'DELIVERED', 'FITTED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'WORK_ORDER_OVERDUE';
ALTER TYPE "NotificationType" ADD VALUE 'WORK_ORDER_DUE_SOON';

-- CreateTable
CREATE TABLE "external_work_orders" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "treatment_id" TEXT,
    "provider_id" TEXT,
    "reference_no" TEXT,
    "status" "ExternalWorkOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "sent_at" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "fitted_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancel_reason" TEXT,
    "agreed_cost" DECIMAL(14,2),
    "actual_cost" DECIMAL(14,2),
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "remake_of_id" TEXT,
    "remake_reason" TEXT,
    "overdue_notified_at" TIMESTAMP(3),
    "note" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_work_order_items" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit_cost" DECIMAL(12,2),
    "specs" JSONB,

    CONSTRAINT "external_work_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "external_work_orders_clinic_id_status_idx" ON "external_work_orders"("clinic_id", "status");

-- CreateIndex
CREATE INDEX "external_work_orders_clinic_id_due_date_idx" ON "external_work_orders"("clinic_id", "due_date");

-- CreateIndex
CREATE INDEX "external_work_orders_supplier_id_idx" ON "external_work_orders"("supplier_id");

-- CreateIndex
CREATE INDEX "external_work_orders_patient_id_idx" ON "external_work_orders"("patient_id");

-- CreateIndex
CREATE INDEX "external_work_orders_organization_id_idx" ON "external_work_orders"("organization_id");

-- CreateIndex
CREATE INDEX "external_work_order_items_work_order_id_idx" ON "external_work_order_items"("work_order_id");

-- AddForeignKey
ALTER TABLE "external_work_orders" ADD CONSTRAINT "external_work_orders_remake_of_id_fkey" FOREIGN KEY ("remake_of_id") REFERENCES "external_work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_work_order_items" ADD CONSTRAINT "external_work_order_items_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "external_work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
