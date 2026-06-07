import { z } from 'zod';
import { SearchHotelsSchema } from '../../schemas/queries';

export type SearchHotels = z.infer<typeof SearchHotelsSchema>;
