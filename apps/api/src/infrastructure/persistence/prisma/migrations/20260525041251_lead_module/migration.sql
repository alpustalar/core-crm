-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WHATSAPP', 'MANUAL');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "source" "LeadSource" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "assignedToId" TEXT,
    "patientId" TEXT,
    "appointmentId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "lostReason" TEXT,
    "lostAt" TIMESTAMP(3),
    "whatsAppConversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_whatsAppConversationId_key" ON "leads"("whatsAppConversationId");

-- CreateIndex
CREATE INDEX "leads_clinicId_status_idx" ON "leads"("clinicId", "status");

-- CreateIndex
CREATE INDEX "leads_phone_idx" ON "leads"("phone");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
