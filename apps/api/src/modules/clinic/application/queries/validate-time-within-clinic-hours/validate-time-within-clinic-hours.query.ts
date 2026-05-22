import { IQuery } from '@nestjs/cqrs';

export interface ValidateTimeWithinClinicHoursItem {
  date: Date;
  startMinute: number;
  endMinute: number;
}

export class ValidateTimeWithinClinicHoursOrThrowQuery implements IQuery {
  readonly __responseType!: void;

  constructor(
    public readonly clinicId: string,
    public readonly items: ValidateTimeWithinClinicHoursItem[]
  ) {}
}
