-- CreateEnum
CREATE TYPE "JournalEntryStatus" AS ENUM ('DRAFT', 'POSTED', 'REVERSED');

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "clinic_id" TEXT,
    "period_id" TEXT NOT NULL,
    "entry_no" BIGINT,
    "entry_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "status" "JournalEntryStatus" NOT NULL DEFAULT 'DRAFT',
    "event_id" TEXT,
    "reversed_by_id" TEXT,
    "performed_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_lines" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "party_id" TEXT,
    "debit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "line_desc" TEXT,

    CONSTRAINT "journal_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_event_id_key" ON "journal_entries"("event_id");

-- CreateIndex
CREATE INDEX "journal_entries_organization_id_entry_date_idx" ON "journal_entries"("organization_id", "entry_date");

-- CreateIndex
CREATE INDEX "journal_entries_period_id_idx" ON "journal_entries"("period_id");

-- CreateIndex
CREATE INDEX "journal_lines_entry_id_idx" ON "journal_lines"("entry_id");

-- CreateIndex
CREATE INDEX "journal_lines_account_id_idx" ON "journal_lines"("account_id");

-- CreateIndex
CREATE INDEX "journal_lines_party_id_idx" ON "journal_lines"("party_id");

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "accounting_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "financial_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_reversed_by_id_fkey" FOREIGN KEY ("reversed_by_id") REFERENCES "journal_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
