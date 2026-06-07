import { z } from 'zod';

const LocationTypeEnum = z.enum(['IATA', 'ATLAS', 'GPS', 'PORT', 'STATION']);
const DatePattern = /^\d{4}-\d{2}-\d{2}$/;
const TimePattern = /^\d{2}:\d{2}$/;

export const SearchTransferAvailabilitySchema = z.object({
  language: z.string().default('en'),
  fromType: LocationTypeEnum,
  fromCode: z.string().min(1),
  toType: LocationTypeEnum,
  toCode: z.string().min(1),
  outboundDate: z.string().regex(DatePattern, 'YYYY-MM-DD formatında olmalı'),
  outboundTime: z.string().regex(TimePattern, 'HH:mm formatında olmalı'),
  adults: z.coerce.number().int().positive(),
  children: z.coerce.number().int().min(0).default(0),
  infants: z.coerce.number().int().min(0).default(0),
  ages: z.string().optional(),
  returnDate: z
    .string()
    .regex(DatePattern, 'YYYY-MM-DD formatında olmalı')
    .optional(),
  returnTime: z
    .string()
    .regex(TimePattern, 'HH:mm formatında olmalı')
    .optional(),
});
