export class FindClinicAvailabilityByDayQuery {
  constructor(
    public readonly clinicId: string,
    public readonly date: Date
  ) {}
}
