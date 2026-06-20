-- AlterTable
ALTER TABLE "messages" ADD COLUMN "template_name" TEXT,
ADD COLUMN "template_language" TEXT,
ADD COLUMN "template_params" JSONB;
