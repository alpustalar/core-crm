import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetWaitingRoomQuery } from './get-waiting-room.query';
import { GetWaitingRoomResponse } from './get-waiting-room.response';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindProvidersDirectoryQuery } from '@modules/clinical/provider/application/queries/find-providers-directory/find-providers-directory.query';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';
import { WaitingRoomEntry } from '@modules/clinical/appointment/domain/contracts/appointment';

/**
 * Bekleme odası: kliniğe gelmiş (ARRIVED) hastalar, geliş sırasına göre (repo
 * checkedInAt'e göre sıralar). Doktor adları cross-module directory'den zenginleştirilir
 * (bounded-context: Prisma join YOK). Yetki klinik-seviye policy ile korunur.
 */
@QueryHandler(GetWaitingRoomQuery)
export class GetWaitingRoomHandler
  implements IQueryHandler<GetWaitingRoomQuery, GetWaitingRoomResponse>
{
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(query: GetWaitingRoomQuery): Promise<GetWaitingRoomResponse> {
    const { filter, ctx } = query;

    const clinicId = filter.clinicId;

    const [{ data: providers }, rows] = await Promise.all([
      this.queryBus.execute(new FindProvidersDirectoryQuery(clinicId)),
      this.appointmentRepo.findWaitingRoom({
        clinicId,
        providerId: filter.providerId,
      }),
    ]);

    const providerNameById = new Map(
      providers.map((provider) => [provider.providerId, provider.name])
    );

    const entries: WaitingRoomEntry[] = rows.map((row) => ({
      appointmentId: row.id,
      providerId: row.providerId,
      providerName: providerNameById.get(row.providerId) ?? null,
      patientId: row.patientId,
      patientName: row.patientName,
      patientPhone: row.patientPhone,
      startTime: row.startTime,
      checkedInAt: row.checkedInAt,
      treatmentType: row.treatmentType,
    }));

    return {
      data: entries,
      meta: {
        serializationOptions: this.policyFactory
          .appointment(ctx.actor, ctx.source)
          .policy.getSerializationOptions({
            clinicId,
            providerId: filter.providerId,
          }),
      },
    };
  }
}
