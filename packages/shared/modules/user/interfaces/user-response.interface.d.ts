import { Role, UserStatusSchema } from "@shared/generated-zod";
import { DoctorResponse } from "../../doctor";
import { z } from "zod";
import { UserStatusType } from "@shared/generated-zod/inputTypeSchemas/UserStatusSchema";
export type UserStatus = z.infer<typeof UserStatusSchema>;
export interface RelationalDto {
    id: string;
    name: string;
}
export interface UserResponse {
    id: string;
    displayName: string;
    picture?: string;
    clinicId?: string;
    email: string;
    role: Role;
    emailVerified: boolean;
    lastLogin: Date;
    status: UserStatusType;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    managedClinics?: RelationalDto[];
    ownedOrganizations?: RelationalDto[];
    doctorProfile?: DoctorResponse;
}
