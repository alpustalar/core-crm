export const TREATMENT_PACKAGE_EVENTS = {
  CREATED: 'treatment-package.created',
  UPDATED: 'treatment-package.updated',
  SOFT_DELETED: 'treatment-package.deleted',
} as const;

export type TreatmentPackageEvent =
  (typeof TREATMENT_PACKAGE_EVENTS)[keyof typeof TREATMENT_PACKAGE_EVENTS];
