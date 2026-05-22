import { Body, Controller, Post } from '@nestjs/common';
import { PatientAuthService } from './patient-auth.service';
import { PatientVerifyDto } from '@shared/modules/patients/dto/commands';
import { Public } from '@common/decorators/public.decorator';

@Controller('patient-auth')
export class PatientAuthController {
  constructor(private readonly patientAuthService: PatientAuthService) {}

  @Public()
  @Post('verify')
  verify(@Body() dto: PatientVerifyDto) {
    return this.patientAuthService.verifyAndRegister(dto);
  }
}
