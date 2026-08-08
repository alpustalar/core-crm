import {
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  /** Klinik kapsamlıysa `clinicId` ile kurulur (bkz. §10 — aktif klinik URL'de taşınır). */
  href: (context: { clinicId?: string }) => string;
  icon: LucideIcon;
  /** Gizlemek için gereken yetkinlik; yoksa herkese görünür. */
  capability?: string;
}

/**
 * Kenar çubuğu backend'in modül gruplarını yansıtır. Liste bilerek **kısa
 * başlıyor**: yalnız gerçekten var olan ekranlar burada. Henüz yazılmamış
 * modülleri şimdiden koymak kullanıcıya 404'e giden ölü bağlantılar göstermek
 * olurdu. Her modül indikçe buraya bir satır eklenir.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Panel',
    href: () => '/dashboard',
    icon: LayoutDashboard,
  },
];
