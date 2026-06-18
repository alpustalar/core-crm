-- CreateEnum
CREATE TYPE "EDocumentType" AS ENUM ('E_FATURA', 'E_ARSIV', 'E_SMM', 'INTERNAL');

-- CreateEnum
CREATE TYPE "EDocumentStatus" AS ENUM ('DRAFT', 'QUEUED', 'SENT', 'ACCEPTED', 'REJECTED', 'INTERNAL', 'FAILED');

-- AlterTable
ALTER TABLE "invoices"
  ADD COLUMN "document_type" "EDocumentType",
  ADD COLUMN "einvoice_uuid" TEXT,
  ADD COLUMN "einvoice_status" "EDocumentStatus" NOT NULL DEFAULT 'DRAFT';
