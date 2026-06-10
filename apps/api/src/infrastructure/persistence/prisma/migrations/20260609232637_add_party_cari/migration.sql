-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "PartyRole" AS ENUM ('CUSTOMER', 'PATIENT', 'SUPPLIER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "PartyOriginType" AS ENUM ('PATIENT', 'SUPPLIER', 'USER', 'EXTERNAL');

-- CreateTable
CREATE TABLE "parties" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "type" "PartyType" NOT NULL,
    "roles" "PartyRole"[],
    "name" TEXT NOT NULL,
    "tax_number" TEXT,
    "national_id" TEXT,
    "tax_office" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "is_einvoice_user" BOOLEAN NOT NULL DEFAULT false,
    "einvoice_mailbox" TEXT,
    "receivable_account_id" TEXT,
    "payable_account_id" TEXT,
    "origin_type" "PartyOriginType" NOT NULL,
    "origin_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parties_organization_id_idx" ON "parties"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "parties_organization_id_origin_type_origin_id_key" ON "parties"("organization_id", "origin_type", "origin_id");

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
