-- CreateEnum
CREATE TYPE "PosTransactionKind" AS ENUM ('SALE', 'VOID', 'REFUND');

-- AlterTable
ALTER TABLE "pos_transactions" ADD COLUMN     "active_void_original_id" TEXT,
ADD COLUMN     "kind" "PosTransactionKind" NOT NULL DEFAULT 'SALE',
ADD COLUMN     "original_pos_transaction_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "pos_transactions_active_void_original_id_key" ON "pos_transactions"("active_void_original_id");

-- CreateIndex
CREATE INDEX "pos_transactions_original_pos_transaction_id_idx" ON "pos_transactions"("original_pos_transaction_id");

-- AddForeignKey
ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_original_pos_transaction_id_fkey" FOREIGN KEY ("original_pos_transaction_id") REFERENCES "pos_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
