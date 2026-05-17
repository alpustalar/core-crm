import type {
  Clinic,
  FinanceLedger,
  Organization,
  Provider,
  Role,
  User as IUser,
} from '@shared';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';

export type UserWithRelations = IUser & {
  role: Role | null;
  workingClinic: Clinic | null;
  managedClinics: Clinic[] | null;
  ownedOrganizations: Organization[] | null;
  providerProfile: Provider | null;
  financeLedgers: FinanceLedger[] | null;
};

export class User implements IUser {
  readonly id: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  status: GlobalStatusType;
  roleId: string | null;
  picture: string | null;
  clinicId: string | null;
  readonly lastLogin: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  deletedAt: Date | null;

  // İlişkiler
  role: Role | null;
  workingClinic: Clinic | null;
  managedClinics: Clinic[] | null;
  ownedOrganizations: Organization[] | null;
  providerProfile: Provider | null;
  financeLedgers: FinanceLedger[] | null;

  constructor(props: UserWithRelations) {
    this.id = props.id!;
    this.displayName = props.displayName!;
    this.email = props.email!;
    this.emailVerified = props.emailVerified!;
    this.status = props.status;
    this.roleId = props.roleId ?? null;
    this.picture = props.picture ?? null;
    this.clinicId = props.clinicId ?? null;
    this.lastLogin = props.lastLogin!;
    this.createdAt = props.createdAt!;
    this.updatedAt = props.updatedAt!;
    this.deletedAt = props.deletedAt;

    // İlişki Atamaları
    this.role = props.role ?? null;
    this.workingClinic = props.workingClinic ?? null;
    this.managedClinics = props.managedClinics ?? null;
    this.ownedOrganizations = props.ownedOrganizations ?? null;
    this.providerProfile = props.providerProfile ?? null;
    this.financeLedgers = props.financeLedgers ?? null;
  }

  get isDeleted(): boolean {
    return !!this.deletedAt;
  }

  // --- Domain Logic (Beyin Kısmı) ---

  get isActive(): boolean {
    return this.status === 'ACTIVE' && !this.isDeleted;
  }

  /**
   * Örnek: Kullanıcının bir klinikte yönetici olup olmadığını kontrol eder.
   */
  isManagerOf(clinicId: string): boolean {
    return (
      this.managedClinics?.some((clinic) => clinic.id === clinicId) ?? false
    );
  }
}
