export type FindClinicAvailabilityByDayResponse = {
  isOpen: boolean;
  workingHours: {
    startMinute: number;
    endMinute: number;
  } | null;
  reason: string | null;
};
