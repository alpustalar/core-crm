import { z } from "zod";
export const PortSchema = z.number().int().positive().max(65535)