export class GetClinicScheduleQuery {
  constructor(
    public readonly clinicId: string,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}
