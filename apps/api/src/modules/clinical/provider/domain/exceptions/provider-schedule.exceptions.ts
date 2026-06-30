// modules/appointment/domain/exceptions/provider-schedule.exceptions.ts

export class ProviderNotWorkingDayException extends Error {
  constructor() {
    super('Doktor bu gün çalışmıyor.');
    this.name = 'ProviderNotWorkingDayException';
  }
}

export class ProviderOutsideWorkingHoursException extends Error {
  constructor() {
    super('Randevu saati doktorun çalışma saatleri dışında.');
    this.name = 'ProviderOutsideWorkingHoursException';
  }
}

export class ProviderOnBreakException extends Error {
  constructor() {
    super('Randevu doktorun mola saatleriyle çakışıyor.');
    this.name = 'ProviderOnBreakException';
  }
}

export class ProviderIsOffException extends Error {
  constructor(reason?: string) {
    super(reason ?? 'Doktor bu saatte müsait değil (İzinli/Kapalı).');
    this.name = 'ProviderIsOffException';
  }
}
