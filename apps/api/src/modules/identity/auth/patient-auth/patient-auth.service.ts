import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@modules/identity/auth/firebase/domain/interfaces/firebase.service.interface';

import { FindPatientByIdQuery } from '@modules/crm/patient/application/queries/find-patient-by-id/find-patient-by-id.query';
import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { FindPatientByContactQuery } from '@modules/crm/patient/application/queries/find-patient-by-contact/find-patient-by-contact.query';
import { CreatePatientCommand } from '@modules/crm/patient/application/commands/create-patient/create-patient.command';

interface PatientVerifyInput {
  idToken: string;
  organizationId: string;
  firstName: string;
}

@Injectable()
export class PatientAuthService {
  private readonly internalCtx = ExecutionContextFactory.createInternal();

  constructor(
    @Inject(FIREBASE_SERVICE)
    private readonly firebaseService: IFirebaseService,
    private readonly queryBus: TSQueryBus,
    private readonly commandBus: TSCommandBus
  ) {}

  async verifyAndRegister(dto: PatientVerifyInput): Promise<Patient> {
    const { idToken, organizationId, firstName } = dto;

    const decodedToken = await this.firebaseService.verifyToken(idToken);
    if (!decodedToken) {
      throw new UnauthorizedException('Firebase token geçersiz.');
    }

    const phone = decodedToken.phone_number;
    if (!phone) {
      throw new UnauthorizedException('Token telefon numarası içermiyor.');
    }

    const patient = await this.queryBus.execute(
      new FindPatientByContactQuery(organizationId, phone)
    );

    if (!patient) {
      const id = crypto.randomUUID();
      await this.commandBus.execute(
        new CreatePatientCommand({ phone, organizationId, firstName, id })
      );

      return Patient.create({ id, phone, organizationId, firstName });
    }

    return patient.data!;
  }

  async findPatientByToken(idToken: string): Promise<Patient> {
    const decodedToken = await this.firebaseService.verifyToken(idToken);
    if (!decodedToken) {
      throw new UnauthorizedException('Firebase token geçersiz.');
    }

    const { data: patient } = await this.queryBus.execute(
      new FindPatientByIdQuery(decodedToken.uid, this.internalCtx)
    );
    if (!patient) {
      throw new UnauthorizedException(
        'Hasta kaydı bulunamadı. Lütfen önce kayıt olunuz.'
      );
    }

    return patient;
  }
}
