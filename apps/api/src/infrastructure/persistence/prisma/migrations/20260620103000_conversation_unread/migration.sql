-- AlterTable: gelen-kutusu okunmamış sayacı + ajan okuma anı
ALTER TABLE "conversations" ADD COLUMN "unread_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "agent_read_at" TIMESTAMP(3);
