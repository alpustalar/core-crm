import { GlobalStatusType } from "@shared/generated-zod/inputTypeSchemas/GlobalStatusSchema";

export interface IOrganizationResponse {
    id: string;
    name: string;
    slug: string;
    phone: string | null;
    email: string | null;
    status: GlobalStatusType;
    timezone: string;
    createdAt: Date;
}