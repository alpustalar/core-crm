import { IGetContext } from '@common/decorators/get-context.decorator';

/**
 * Hasta kliniğe geldiğinde randevuyu check-in (ARRIVED) eder — bekleme odasına alır.
 * Yalnız bekleyen/onaylanan randevular için geçerlidir.
 */
export class CheckInAppointmentCommand {
  readonly __responseType!: void;

  constructor(
    public readonly appointmentId: string,
    public readonly ctx: IGetContext
  ) {}
}
