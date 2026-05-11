import { ClinicOperationMode, Prisma } from '@prisma/client';

type PreparedClinicCreateInput = Omit<
  Prisma.ClinicCreateInput,
  'sectorId' | 'sector'
>;

export const clinicCreateInput: PreparedClinicCreateInput = {
  slug: 'test-dis-klinigi',
  name: 'Test Diş Kliniği',
  phone: '02241234567',
  email: 'info@testdisklinigi.com',
  address: 'FSM Bulvarı No:10',
  city: 'Bursa',
  district: 'Nilüfer',
  consultationSlotDuration: 15,
  operationMode: ClinicOperationMode.STATIC,
};
