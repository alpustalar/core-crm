import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@modules/identity/auth/firebase/domain/interfaces/firebase.service.interface';

import { FindPatientByFirebaseUidQuery } from '@modules/crm/patient/application/queries/find-patient-by-firebase-uid/find-patient-by-firebase-uid.query';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { FindPatientByContactQuery } from '@modules/crm/patient/application/queries/find-patient-by-contact/find-patient-by-contact.query';

import {
  PatientNotFoundException,
  PatientNotRegisteredException,
} from '@modules/crm/patient/domain/exceptions/patient.exceptions';
import { isRegisteredPatient, RegisteredPatient } from '@shared';
import { RegisterPatientAccountCommand } from '@modules/identity/auth/registration/application/commands/register-patient-account/register-patient-account.command';

interface PatientVerifyInput {
  idToken: string;
  organizationId: string;
  clinicId: string;
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

  async verifyAndRegister(dto: PatientVerifyInput): Promise<RegisteredPatient> {
    const { idToken, organizationId, clinicId, firstName } = dto;

    const decodedToken = await this.firebaseService.verifyToken(idToken);
    if (!decodedToken) {
      throw new UnauthorizedException('Firebase token geçersiz.');
    }

    const phone = decodedToken.phone_number;
    if (!phone) {
      throw new UnauthorizedException('Token telefon numarası içermiyor.');
    }

    const firebaseUid = decodedToken.uid;

    const { data: patient } = await this.queryBus.execute(
      new FindPatientByContactQuery(organizationId, phone)
    );

    if (!patient) {
      await this.commandBus.execute(
        new RegisterPatientAccountCommand({
          phone,
          organizationId,
          clinicId,
          firstName,
          firebaseUid,
        })
      );

      const { data: patient } = await this.commandBus.execute(
        new FindPatientByFirebaseUidQuery(firebaseUid, this.internalCtx)
      );

      if (!patient) throw new PatientNotFoundException();

      return patient;
    }

    if (!patient) {
      throw new PatientNotFoundException();
    }

    const isRegistered = isRegisteredPatient(patient);

    if (!isRegistered) throw new PatientNotRegisteredException();

    return patient;
  }

  async findPatientByToken(idToken: string): Promise<RegisteredPatient> {
    const decodedToken = await this.firebaseService.verifyToken(idToken);
    if (!decodedToken) {
      throw new UnauthorizedException('Firebase token geçersiz.');
    }

    const { data: patient } = await this.queryBus.execute(
      new FindPatientByFirebaseUidQuery(decodedToken.uid, this.internalCtx)
    );
    if (!patient) {
      throw new UnauthorizedException(
        'Hasta kaydı bulunamadı. Lütfen önce kayıt olunuz.'
      );
    }

    const isRegistered = isRegisteredPatient(patient);

    if (!isRegistered) throw new PatientNotRegisteredException();

    return patient;
  }
}
