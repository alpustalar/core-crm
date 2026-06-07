import { z } from 'zod';

export const PatientScalarFieldEnumSchema = z.enum(['id','organizationId','clinicId','sectorId','firstName','lastName','tcNo','birthDate','gender','phone','alternativePhone','email','address','emergencyContact','companionName','companionPhone','profilePhoto','protocolNo','allergies','chronicDiseases','bloodType','status','patientType','responsibleProviderId','checkupDate','discountRate','createdAt','updatedAt','deletedAt']);

export default PatientScalarFieldEnumSchema;
