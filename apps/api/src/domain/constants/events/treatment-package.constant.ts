export const TREATMENT_PACKAGE_EVENTS = {
  CREATED: 'treatment-package.created',
  UPDATED: 'treatment-package.updated',
  SOFT_DELETED: 'treatment-package.deleted',
} as const;

export type TreatmentPackageEvent =
  (typeof TREATMENT_PACKAGE_EVENTS)[keyof typeof TREATMENT_PACKAGE_EVENTS];

export const PATIENT_TREATMENT_PACKAGE_EVENTS = {
  CREATED: 'patient-treatment-package.created',
  UPDATED: 'patient-treatment-package.updated',
  SOFT_DELETED: 'patient-treatment-package.deleted',
} as const;

export type PatientTreatmentPackageEvent =
  (typeof PATIENT_TREATMENT_PACKAGE_EVENTS)[keyof typeof PATIENT_TREATMENT_PACKAGE_EVENTS];
