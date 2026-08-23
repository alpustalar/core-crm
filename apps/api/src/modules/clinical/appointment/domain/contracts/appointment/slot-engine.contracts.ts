export interface FindProviderOpenSlotsInput {
  providerId: string;
  clinicId: string;
  date: string;
  durationMinutes: number;
}

export interface OpenSlot {
  time: string;
  start: Date;
  durationMinutes: number;
}

export interface ClinicOpenSlot {
  providerId: string;
  providerName: string;
  time: string;
  start: Date;
  end: Date;
  durationMinutes: number;
}

export interface ClinicOpenSlotsDay {
  date: string;
  slots: ClinicOpenSlot[];
}
