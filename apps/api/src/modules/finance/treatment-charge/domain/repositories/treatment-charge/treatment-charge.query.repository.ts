import { TreatmentCharge as ITreatmentCharge } from '@shared';

export const TREATMENT_CHARGE_QUERY_REPOSITORY = Symbol(
  'ITreatmentChargeQueryRepository'
);

export interface ITreatmentChargeQueryRepository {
  /** Okuma tarafı düz model döner — veri doğrudan HTTP sınırını geçer. */
  findByAppointmentId(input: {
    appointmentId: string;
    includeVoided: boolean;
  }): Promise<ITreatmentCharge[]>;

  findById(id: string): Promise<ITreatmentCharge | null>;
}
