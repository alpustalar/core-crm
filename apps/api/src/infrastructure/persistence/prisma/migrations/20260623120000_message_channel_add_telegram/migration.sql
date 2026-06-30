-- MessageChannel enum'una TELEGRAM eklenir (çok kanallı messaging).
-- Enum değeri ekleme ayrı migration'da: yeni değer aynı transaction'da KULLANILAMAZ.
ALTER TYPE "MessageChannel" ADD VALUE IF NOT EXISTS 'TELEGRAM';
