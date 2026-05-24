-- CreateEnum
CREATE TYPE "MetaLeadStatus" AS ENUM ('NEW', 'MATCHED', 'CONVERTED', 'INVALID');

-- CreateTable
CREATE TABLE "meta_ad_accounts" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "ad_account_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "page_id" TEXT,
    "business_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meta_ad_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta_campaign_metrics" (
    "id" TEXT NOT NULL,
    "meta_ad_account_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "campaign_name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "spend" DECIMAL(10,2) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "cpc" DECIMAL(10,4),
    "ctr" DECIMAL(10,4),
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meta_campaign_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta_leads" (
    "id" TEXT NOT NULL,
    "meta_ad_account_id" TEXT NOT NULL,
    "meta_lead_id" TEXT NOT NULL,
    "form_id" TEXT,
    "campaign_id" TEXT,
    "campaign_name" TEXT,
    "adset_id" TEXT,
    "ad_id" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "raw_data" JSONB,
    "status" "MetaLeadStatus" NOT NULL DEFAULT 'NEW',
    "matched_patient_id" TEXT,
    "matched_appointment_id" TEXT,
    "matched_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meta_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meta_ad_accounts_clinic_id_ad_account_id_key" ON "meta_ad_accounts"("clinic_id", "ad_account_id");

-- CreateIndex
CREATE INDEX "meta_campaign_metrics_meta_ad_account_id_date_idx" ON "meta_campaign_metrics"("meta_ad_account_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "meta_campaign_metrics_meta_ad_account_id_campaign_id_date_key" ON "meta_campaign_metrics"("meta_ad_account_id", "campaign_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "meta_leads_meta_lead_id_key" ON "meta_leads"("meta_lead_id");

-- CreateIndex
CREATE INDEX "meta_leads_meta_ad_account_id_status_idx" ON "meta_leads"("meta_ad_account_id", "status");

-- CreateIndex
CREATE INDEX "meta_leads_phone_idx" ON "meta_leads"("phone");

-- CreateIndex
CREATE INDEX "meta_leads_email_idx" ON "meta_leads"("email");

-- AddForeignKey
ALTER TABLE "meta_ad_accounts" ADD CONSTRAINT "meta_ad_accounts_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meta_campaign_metrics" ADD CONSTRAINT "meta_campaign_metrics_meta_ad_account_id_fkey" FOREIGN KEY ("meta_ad_account_id") REFERENCES "meta_ad_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meta_leads" ADD CONSTRAINT "meta_leads_meta_ad_account_id_fkey" FOREIGN KEY ("meta_ad_account_id") REFERENCES "meta_ad_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
