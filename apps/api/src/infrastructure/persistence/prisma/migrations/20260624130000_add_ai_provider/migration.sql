-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('ANTHROPIC', 'GEMINI');

-- AlterTable
ALTER TABLE "clinic_ai_agent_configs" ADD COLUMN     "provider" "AiProvider" NOT NULL DEFAULT 'ANTHROPIC';
