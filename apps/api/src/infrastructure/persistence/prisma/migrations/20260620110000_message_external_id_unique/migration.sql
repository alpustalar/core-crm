-- Inbound idempotency: WhatsApp wamid (external_id) genel benzersizdir. Mükerrer/eşzamanlı
-- webhook teslimine karşı DB-seviyesi tekillik. Mevcut non-unique index düşürülüp unique
-- index ile değiştirilir. external_id nullable → Postgres'te çoklu NULL serbest (giden
-- mesajlar wamid atanana dek NULL kalır).
DROP INDEX "messages_external_id_idx";

CREATE UNIQUE INDEX "messages_external_id_key" ON "messages"("external_id");
