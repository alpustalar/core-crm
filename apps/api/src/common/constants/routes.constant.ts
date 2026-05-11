// 1. Önce temel parçaları (atomic paths) tanımlıyoruz
const BASE_PATHS = {
  ORGANIZATIONS: 'organizations',
  CLINICS: 'clinics',
  USERS: 'users',
  PAYMENTS: 'payments',
  IYZICO: 'iyzico',
  CALLBACK: 'callback',
} as const;

// 2. Hiyerarşiyi ve birleştirilmiş (computed) yolları kuruyoruz
export const ROUTE_PATHS = {
  ORGANIZATIONS: BASE_PATHS.ORGANIZATIONS,
  CLINICS: BASE_PATHS.CLINICS,
  USERS: BASE_PATHS.USERS,
  PAYMENTS: {
    ROOT: BASE_PATHS.PAYMENTS,
    IYZICO: {
      ROOT: BASE_PATHS.IYZICO,
      CALLBACK: BASE_PATHS.CALLBACK,
      FULL_CALLBACK_PATH: `${BASE_PATHS.PAYMENTS}/${BASE_PATHS.IYZICO}/${BASE_PATHS.CALLBACK}`,
    },
  },
} as const;

export type RoutePaths = typeof ROUTE_PATHS;
