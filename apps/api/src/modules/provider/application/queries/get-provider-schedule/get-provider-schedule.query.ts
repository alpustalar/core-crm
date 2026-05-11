export class GetProviderScheduleQuery {
  constructor(
    public readonly providerId: string,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}
