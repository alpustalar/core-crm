import { IRequestWithPatient } from '@common/interfaces';
import { getBearerToken } from '@common/utils';
import { PatientAuthService } from '@modules/identity/auth/patient-auth/patient-auth.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class PatientGuard implements CanActivate {
  constructor(private readonly patientAuthService: PatientAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithPatient>();

    const idToken = getBearerToken(request.headers.authorization);

    if (!idToken) throw new UnauthorizedException('Token bulunamadı.');

    const patient = await this.patientAuthService.findPatientByToken(idToken);

    request.patientActor = {
      patientId: patient.id,
      organizationId: patient.organizationId,
      phone: patient.phone,
      email: patient.email ?? undefined,
      clinicId: patient.clinicId ?? undefined,
      firstName: patient.firstName,
    };

    return true;
  }
}
