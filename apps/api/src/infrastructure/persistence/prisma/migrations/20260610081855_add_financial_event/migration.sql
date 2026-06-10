-- CreateEnum
CREATE TYPE "FinancialEventType" AS ENUM ('SALES_INVOICE_ISSUED', 'SALES_INVOICE_CANCELLED', 'PURCHASE_INVOICE_RECEIVED', 'PAYMENT_RECEIVED', 'PAYMENT_MADE', 'INSTRUMENT_RECEIVED', 'INSTRUMENT_GIVEN', 'INSTRUMENT_CLEARED', 'STOCK_IN', 'STOCK_OUT', 'EXPENSE_RECORDED', 'PAYROLL_ACCRUED', 'DEPRECIATION', 'FX_REVALUATION', 'MANUAL_JOURNAL', 'OPENING_BALANCE', 'PERIOD_CLOSING');

-- CreateTable
CREATE TABLE "financial_events" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "clinic_id" TEXT,
    "type" "FinancialEventType" NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "payload" JSONB NOT NULL,
    "source_module" TEXT NOT NULL,
    "source_ref_id" TEXT,
    "dedupe_key" TEXT,
    "performed_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_events_dedupe_key_key" ON "financial_events"("dedupe_key");

-- CreateIndex
CREATE INDEX "financial_events_organization_id_occurred_at_idx" ON "financial_events"("organization_id", "occurred_at");

-- CreateIndex
CREATE INDEX "financial_events_source_module_source_ref_id_idx" ON "financial_events"("source_module", "source_ref_id");

-- AddForeignKey
ALTER TABLE "financial_events" ADD CONSTRAINT "financial_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
