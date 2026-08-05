import { LogSource } from '@src/domain/constants/log-action.constant';
import { ActorContext, PatientActorContext } from '@common/interfaces';

export const SYSTEM_ACTOR: ActorContext = {
  userId: 'SYSTEM',
  email: 'system@bursadentistry.com',
  rolePriority: 100,
  capabilities: ['*'],
  source: LogSource.SYSTEM,
};

export const SYSTEM_PATIENT_ACTOR: PatientActorContext = {
  patientId: 'SYSTEM_PATIENT',
  organizationId: 'SYSTEM_ORGANIZATION',
  phone: '05155555555',
  firstName: 'SYSTEM_PATIENT',
};
