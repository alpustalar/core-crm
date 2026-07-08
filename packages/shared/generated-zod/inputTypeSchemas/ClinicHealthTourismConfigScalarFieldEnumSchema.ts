import { z } from 'zod';

export const ClinicHealthTourismConfigScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','isEnabled','destinationCode','nearbyHotelCodes','airportIata','clinicLocationType','clinicLocationCode','pickupAddress','serviceFeePercent','defaultCurrency','createdAt','updatedAt']);

export default ClinicHealthTourismConfigScalarFieldEnumSchema;
