-- CreateEnum
CREATE TYPE "CashRegisterStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CashSessionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "CashMovementType" AS ENUM ('OPENING_FLOAT', 'SALE_COLLECTION', 'REFUND_PAYOUT', 'EXPENSE', 'CASH_IN', 'CASH_OUT', 'BANK_DEPOSIT');

-- CreateEnum
CREATE TYPE "CashMovementDirection" AS ENUM ('IN', 'OUT');

-- AlterEnum
ALTER TYPE "FinancialEventType" ADD VALUE 'CASH_SESSION_CLOSED';

-- CreateTable
CREATE TABLE "cash_registers" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "status" "CashRegisterStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_registers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_sessions" (
    "id" TEXT NOT NULL,
    "cash_register_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "status" "CashSessionStatus" NOT NULL DEFAULT 'OPEN',
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "opening_float" DECIMAL(14,2) NOT NULL,
    "expected_amount" DECIMAL(14,2),
    "counted_amount" DECIMAL(14,2),
    "difference" DECIMAL(14,2),
    "opened_by_id" TEXT NOT NULL,
    "closed_by_id" TEXT,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "accounting_event_id" TEXT,
    "posted_to_accounting_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_movements" (
    "id" TEXT NOT NULL,
    "cash_session_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "type" "CashMovementType" NOT NULL,
    "direction" "CashMovementDirection" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "description" TEXT,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "performed_by_id" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cash_registers_clinic_id_status_idx" ON "cash_registers"("clinic_id", "status");

-- CreateIndex
CREATE INDEX "cash_registers_organization_id_idx" ON "cash_registers"("organization_id");

-- CreateIndex
CREATE INDEX "cash_sessions_cash_register_id_status_idx" ON "cash_sessions"("cash_register_id", "status");

-- CreateIndex
CREATE INDEX "cash_sessions_clinic_id_opened_at_idx" ON "cash_sessions"("clinic_id", "opened_at");

-- CreateIndex
CREATE INDEX "cash_movements_cash_session_id_idx" ON "cash_movements"("cash_session_id");

-- CreateIndex
CREATE INDEX "cash_movements_clinic_id_occurred_at_idx" ON "cash_movements"("clinic_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_cash_register_id_fkey" FOREIGN KEY ("cash_register_id") REFERENCES "cash_registers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_cash_session_id_fkey" FOREIGN KEY ("cash_session_id") REFERENCES "cash_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
