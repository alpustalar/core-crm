import { Prisma } from '@prisma/client';

export const organizationCreateInput: Prisma.OrganizationCreateInput = {
  slug: 'test',
  name: 'Genel Yönetim',
  email: 'admin@system.com',
  timezone: 'Europe/Istanbul',
  address: 'Sistem Merkezi',
  city: 'Bursa',
} as const;
