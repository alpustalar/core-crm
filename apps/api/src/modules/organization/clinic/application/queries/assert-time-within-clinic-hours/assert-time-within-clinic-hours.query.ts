import { IQuery } from '@nestjs/cqrs';

export interface AssertTimeWithinClinicHoursItem {
  date: Date;
  startMinute: number;
  endMinute: number;
}

export class AssertTimeWithinClinicHoursQuery implements IQuery {
  readonly __responseType!: void;

  constructor(
    public readonly clinicId: string,
    public readonly items: AssertTimeWithinClinicHoursItem[]
  ) {}
}
