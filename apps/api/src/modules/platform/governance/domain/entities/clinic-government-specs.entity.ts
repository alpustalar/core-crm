import { ClinicGovernmentSpecs as IClinicGovernmentSpecs } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import {
  CreateClinicGovernmentSpecsProps,
  UpdateClinicGovernmentSpecsProps,
} from '../types/upsert-clinic-government-specs.props';

/**
 * Kliniğin devlet/regülasyon kimliği (platform/governance bounded-context).
 * Clinic'ten ayrıştırılmış 1:1 satellite; SKRS tesis kodu, USS şifresi ve
 * kliniğin kendi vergi numarasını (fatura için) barındırır.
 */
export class ClinicGovernmentSpecs
  extends AggregateRoot
  implements IClinicGovernmentSpecs
{
  constructor(data: IClinicGovernmentSpecs) {
    super();
    this._id = data.id;
    this._healthFacilityCode = data.healthFacilityCode;
    this._ussPassword = data.ussPassword;
    this._companyTaxNumber = data.companyTaxNumber;
    this._clinicId = data.clinicId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _healthFacilityCode: string;
  get healthFacilityCode(): string {
    return this._healthFacilityCode;
  }

  private _ussPassword: string | null;
  get ussPassword(): string | null {
    return this._ussPassword;
  }

  private _companyTaxNumber: string | null;
  get companyTaxNumber(): string | null {
    return this._companyTaxNumber;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public static create(
    props: CreateClinicGovernmentSpecsProps
  ): ClinicGovernmentSpecs {
    const now = new Date();
    return new ClinicGovernmentSpecs({
      id: props.id ?? crypto.randomUUID(),
      clinicId: props.clinicId,
      healthFacilityCode: props.healthFacilityCode,
      ussPassword: props.ussPassword ?? null,
      companyTaxNumber: props.companyTaxNumber ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public update(props: UpdateClinicGovernmentSpecsProps): void {
    if (props.healthFacilityCode !== undefined) {
      this._healthFacilityCode = props.healthFacilityCode;
    }
    if (props.ussPassword !== undefined) this._ussPassword = props.ussPassword;
    if (props.companyTaxNumber !== undefined) {
      this._companyTaxNumber = props.companyTaxNumber;
    }
  }

  public toPersistence(): IClinicGovernmentSpecs {
    return {
      id: this._id,
      healthFacilityCode: this._healthFacilityCode,
      ussPassword: this._ussPassword,
      companyTaxNumber: this._companyTaxNumber,
      clinicId: this._clinicId,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
