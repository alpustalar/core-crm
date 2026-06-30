-- Kliniğin Instagram DM kanal config'i (messaging) — Clinic'ten ayrıştırılmış satellite.
-- Meta Graph API (Messenger Platform); igUserId = IG professional account id (routing + send).
-- accessToken (Page/IG token) TokenCipherService ile şifreli saklanır.
CREATE TABLE "clinic_instagram_channels" (
    "id" TEXT NOT NULL,
    "ig_user_id" TEXT NOT NULL,
    "page_id" TEXT,
    "username" TEXT,
    "access_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "token_expires_at" TIMESTAMP(3),
    "last_error" TEXT,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_instagram_channels_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clinic_instagram_channels_ig_user_id_key" ON "clinic_instagram_channels"("ig_user_id");
CREATE UNIQUE INDEX "clinic_instagram_channels_clinic_id_key" ON "clinic_instagram_channels"("clinic_id");

ALTER TABLE "clinic_instagram_channels" ADD CONSTRAINT "clinic_instagram_channels_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
