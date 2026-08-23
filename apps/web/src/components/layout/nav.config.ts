import {
  CalendarDays,
  Contact,
  LayoutDashboard,
  MessageSquare,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  /** Klinik kapsamlıysa `clinicId` ile kurulur (bkz. §10 — aktif klinik URL'de taşınır). */
  href: (context: { clinicId?: string }) => string;
  icon: LucideIcon;
  /** Gizlemek için gereken yetkinlik; yoksa herkese görünür. */
  capability?: string;
  /** Klinik kapsamlı öğeler aktif klinik yoksa gösterilmez. */
  requiresClinic?: boolean;
}

/**
 * Kenar çubuğu backend'in modül gruplarını yansıtır. Liste bilerek **kısa**:
 * yalnız gerçekten var olan ekranlar burada. Henüz yazılmamış modülleri
 * şimdiden koymak kullanıcıya 404'e giden ölü bağlantılar göstermek olurdu.
 * Her modül indikçe buraya bir satır eklenir.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Panel',
    href: () => '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Leadler',
    href: ({ clinicId }) => `/clinics/${clinicId}/leads`,
    icon: Users,
    capability: 'lead:read',
    requiresClinic: true,
  },
  {
    label: 'Randevular',
    href: ({ clinicId }) => `/clinics/${clinicId}/appointments`,
    icon: CalendarDays,
    capability: 'appointment:read',
    requiresClinic: true,
  },
  {
    label: 'Hastalar',
    href: ({ clinicId }) => `/clinics/${clinicId}/patients`,
    icon: Contact,
    capability: 'patient:read',
    requiresClinic: true,
  },
  {
    label: 'Mesajlar',
    href: ({ clinicId }) => `/clinics/${clinicId}/messages`,
    icon: MessageSquare,
    // messaging servisi yetkinlik (capability) kontrolü yapmıyor; erişim
    // kapsamı klinik bazlı (`assertActorCanAccessClinic`). Bu yüzden menüde
    // yetkinlik koşulu yok — klinik bağlamı yeterli.
    requiresClinic: true,
  },
  {
    label: 'Finans',
    href: ({ clinicId }) => `/clinics/${clinicId}/finance`,
    icon: Wallet,
    // Cari defter girişi; fatura sekmesi kendi yetkinliğiyle ayrıca korunur.
    capability: 'financeledger:read',
    requiresClinic: true,
  },
];
