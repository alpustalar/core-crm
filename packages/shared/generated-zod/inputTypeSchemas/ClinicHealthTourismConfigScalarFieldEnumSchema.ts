import { z } from 'zod';

export const ClinicHealthTourismConfigScalarFieldEnumSchema = z.enum(['id','isEnabled','destinationCode','nearbyHotelCodes','airportIata','clinicLocationType','clinicLocationCode','pickupAddress','serviceFeePercent','defaultCurrency','clinicId','organizationId','createdAt','updatedAt']);

export default ClinicHealthTourismConfigScalarFieldEnumSchema;
