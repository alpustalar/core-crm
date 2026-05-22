import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@modules/firebase/domain/interfaces/firebase.service.interface';
import { FindOrCreatePatientForAuthQuery } from '@modules/patient/application/queries/find-or-create-patient-for-auth/find-or-create-patient-for-auth.query';
import { FindPatientByIdQuery } from '@modules/patient/application/queries/find-patient-by-id/find-patient-by-id.query';
import { Patient } from '@modules/patient/domain/entities/patient.entity';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PatientVerifyDto } from '@shared/modules/patients/dto/commands';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';

@Injectable()
export class PatientAuthService {
  private readonly internalCtx = ExecutionContextFactory.createInternal();

  constructor(
    @Inject(FIREBASE_SERVICE)
    private readonly firebaseService: IFirebaseService,
    private readonly queryBus: TSQueryBus
  ) {}

  async verifyAndRegister(dto: PatientVerifyDto): Promise<Patient> {
    const { idToken, organizationId, firstName } = dto;

    const decodedToken = await this.firebaseService.verifyToken(idToken);
    if (!decodedToken) {
      throw new UnauthorizedException('Firebase token geçersiz.');
    }

    const phone = decodedToken.phone_number;
    if (!phone) {
      throw new UnauthorizedException('Token telefon numarası içermiyor.');
    }

    const { data } = await this.queryBus.execute(
      new FindOrCreatePatientForAuthQuery({
        phone,
        organizationId,
        firstName,
        firebaseUid: decodedToken.uid,
      })
    );
    return data;
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
