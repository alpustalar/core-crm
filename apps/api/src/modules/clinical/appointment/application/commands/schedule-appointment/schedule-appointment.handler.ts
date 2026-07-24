import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ScheduleAppointmentCommand } from './schedule-appointment.command';
import { ScheduleAppointmentCommandResponse } from './schedule-appointment.response';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { FindPatientByIdQuery } from '@modules/crm/patient/application/queries/find-patient-by-id/find-patient-by-id.query';
import { CreatePatientCommand } from '@modules/crm/patient/application/commands/create-patient/create-patient.command';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { AppointmentCheckerService } from '@modules/clinical/appointment/domain/services/appointment-checker.service';
import { GetClinicAppointmentSettingsQuery } from '@modules/organization/clinic/application/queries/get-clinic-appointment-settings/get-clinic-appointment-settings.query';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TimeZoneSchema } from '@shared';

const DEFAULT_DURATION_MINUTES = 30;

@CommandHandler(ScheduleAppointmentCommand)
export class ScheduleAppointmentHandler
  implements
    ICommandHandler<
      ScheduleAppointmentCommand,
      ScheduleAppointmentCommandResponse
    >
{
  private readonly internalCtx = ExecutionContextFactory.createInternal();

  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly appointmentCheckerService: AppointmentCheckerService,
    private readonly queryBus: TSQueryBus,
    private readonly commandBus: TSCommandBus,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(
    command: ScheduleAppointmentCommand
  ): Promise<ScheduleAppointmentCommandResponse> {
    const { ctx, data } = command;

    this.policyFactory
      .appointment(ctx.actor, ctx.source)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(data.clinicId),
        'Sadece kendi kliniğinizde randevu oluşturabilirsiniz.'
      )
      .orThrow(APPOINTMENT_EVENTS.SCHEDULE);

    const {
      patientId,
      patientName: dtoPatientName,
      patientPhone: dtoPatientPhone,
      patientEmail: dtoPatientEmail,
      providerId,
      treatmentId,
      startTime,
      endTime: dtoEndTime,
      duration,
      notes,
      isConsultation,
      clinicId,
      organizationId,
    } = data;

    // Çakışma (overbooking) kuralı klinik ayarından gelir (Redis'te cache'li — sık
    // randevu oluşturmada her istekte DB'ye gidilmez). staffAllowOverbooking=false
    // ise çakışma engellenir; true (varsayılan) ise personel çakışan saate de yazabilir.
    const { data: settings } = await this.queryBus.execute(
      new GetClinicAppointmentSettingsQuery(clinicId)
    );

    if (!settings.staffAllowOverbooking) {
      const endTime = Appointment.calculateEndTime({
        startTime,
        endTime: dtoEndTime,
        duration: duration ?? DEFAULT_DURATION_MINUTES,
      }).orThrow();

      await this.appointmentCheckerService.assertNoConflict({
        providerId,
        startTime,
        endTime,
      });
    }

    // Walk-in / telefonla oluşturmada da hasta kaydı garanti edilir: mevcut hasta
    // seçildiyse bilgileri okunur, seçilmediyse org+telefonla çöz-veya-oluştur yapılır
    // (CreatePatientCommand mükerrer kaydı önler).
    const {
      patientId: resolvedPatientId,
      patientName,
      patientPhone,
      patientEmail,
    } = await this.resolveOrCreatePatient({
      patientId,
      organizationId,
      clinicId,
      dtoPatientName,
      dtoPatientPhone,
      dtoPatientEmail,
    });

    if (!patientPhone) {
      throw new Error('Hasta telefonu bulunamadı.');
    }

    const appointment = Appointment.schedule({
      patientName,
      patientPhone,
      patientEmail: patientEmail ?? null,
      patientId: resolvedPatientId,
      providerId,
      clinicId,
      treatmentId,
      startTime,
      endTime: dtoEndTime,
      duration: duration ?? DEFAULT_DURATION_MINUTES,
      notes,
      timezone: TimeZoneSchema.enum.Europe_Istanbul,
      isConsultation,
    });

    const validateOptions = this.policyFactory
      .entity(ctx.actor, ctx.source)
      .policy.getValidateOptions();

    appointment
      .rules(validateOptions)
      .schedule({ startTime: data.startTime })
      .orThrow();

    return this.transactionManager.run(async () => {
      const saved = await this.appointmentRepo.create(appointment);
      return saved.id.value;
    });
  }

  private async resolveOrCreatePatient(input: ResolveOrCreatePatientInput) {
    // Mevcut hasta seçildiyse (patientId) kaydından oku.
    if (input.patientId) {
      const { data: patient } = await this.queryBus.execute(
        new FindPatientByIdQuery(input.patientId, this.internalCtx)
      );

      if (patient) {
        return {
          patientId: input.patientId,
          patientName: `${patient.firstName} ${patient.lastName}`,
          patientPhone: patient.phone,
          patientEmail: patient.email ?? undefined,
        };
      }
    }

    // Hasta seçilmemiş (walk-in/telefon) ya da kayıt bulunamadı: telefonla çöz-veya-oluştur.
    const createdPatientId = await this.commandBus.execute(
      new CreatePatientCommand({
        phone: input.dtoPatientPhone,
        organizationId: input.organizationId,
        clinicId: input.clinicId,
        firstName: input.dtoPatientName ?? input.dtoPatientPhone,
      })
    );

    return {
      patientId: createdPatientId,
      patientName: input.dtoPatientName ?? input.dtoPatientPhone,
      patientPhone: input.dtoPatientPhone,
      patientEmail: input.dtoPatientEmail,
    };
  }
}

interface ResolveOrCreatePatientInput {
  patientId?: string | null;
  organizationId: string;
  clinicId: string;
  dtoPatientName?: string | null;
  dtoPatientPhone: string;
  dtoPatientEmail?: string | null;
}
