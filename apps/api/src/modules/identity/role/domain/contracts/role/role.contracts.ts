// ==========================================
// SLUG SORGULAMA YANIT SÖZLEŞMELERİ
// ==========================================

export type FindBySlugResponse = {
  id: string;
  slug: string;
} | null;

export interface CreateRoleProps {
  name: string;
  priority: number;
  isSystemRole: boolean;
}
