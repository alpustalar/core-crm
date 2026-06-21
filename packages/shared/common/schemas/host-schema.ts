import { z } from "zod";

export const HostSchema = z.union([
  z.ipv4(),
  z.ipv6(),
  z.hostname(),
]);

export type HostType = z.infer<typeof HostSchema>;

