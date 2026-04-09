import { GlobalStatusType } from "@shared/generated-zod/inputTypeSchemas/GlobalStatusSchema";
export interface OrganizationResponse {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    status: GlobalStatusType;
    timezone: string;
    createdAt: Date;
}
