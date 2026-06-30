import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindPatientByIdQuery } from '@modules/crm/patient/application/queries/find-patient-by-id/find-patient-by-id.query';
import { EnsurePartyCommand } from '@modules/finance/party/application/commands/ensure-party/ensure-party.command';
import {
  EnsurePartyForPatientCommand,
  EnsurePartyForPatientResult,
} from './ensure-party-for-patient.command';
import { PartyOriginTypeSchema, PartyTypeSchema } from '@shared';

@CommandHandler(EnsurePartyForPatientCommand)
export class EnsurePartyForPatientHandler
  implements
    ICommandHandler<EnsurePartyForPatientCommand, EnsurePartyForPatientResult>
{
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    command: EnsurePartyForPatientCommand
  ): Promise<EnsurePartyForPatientResult> {
    const { patientId, clinicId, role, ctx } = command;

    const { data: patient } = await this.queryBus.execute(
      new FindPatientByIdQuery(patientId, ctx)
    );
    if (!patient) {
      throw new NotFoundException(`Hasta bulunamadı: ${patientId}`);
    }

    const partyId = await this.commandBus.execute(
      new EnsurePartyCommand(
        {
          clinicId,
          organizationId: patient.organizationId,
          originType: PartyOriginTypeSchema.enum.PATIENT,
          originId: patient.id,
          role,
          type: PartyTypeSchema.enum.INDIVIDUAL,
          name:
            [patient.firstName, patient.lastName].filter(Boolean).join(' ') ||
            'İsimsiz Hasta',
          nationalId: patient.tcNo,
          email: patient.email,
          phone: patient.phone,
        },
        ctx
      )
    );

    return { partyId, organizationId: patient.organizationId };
  }
}
