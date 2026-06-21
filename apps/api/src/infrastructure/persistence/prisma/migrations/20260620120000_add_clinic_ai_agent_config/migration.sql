-- Kliniğin AI sohbet asistanı config'i (messaging) — Clinic'ten ayrıştırılmış 1:1 satellite.
-- Gelen WhatsApp mesajlarına otomatik yanıt için persona + (şifreli) Anthropic anahtarı + model.
CREATE TABLE "clinic_ai_agent_configs" (
    "id" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT NOT NULL DEFAULT 'claude-haiku-4-5',
    "system_prompt" TEXT,
    "api_key" TEXT,
    "max_tokens" INTEGER,
    "reply_only_within_window" BOOLEAN NOT NULL DEFAULT true,
    "business_hours" JSONB,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_ai_agent_configs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clinic_ai_agent_configs_clinic_id_key" ON "clinic_ai_agent_configs"("clinic_id");

ALTER TABLE "clinic_ai_agent_configs" ADD CONSTRAINT "clinic_ai_agent_configs_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
