import { Prisma } from '@prisma/client';

export const clinicCreateInput: Prisma.ClinicCreateInput = {
  slug: 'test-dis-klinigi',
  name: 'Test Diş Kliniği',
  phone: '02241234567',
  email: 'info@testdisklinigi.com',
  address: 'FSM Bulvarı No:10',
  city: 'Bursa',
  district: 'Nilüfer',
};
