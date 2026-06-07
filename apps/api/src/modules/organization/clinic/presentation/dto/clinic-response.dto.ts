import { Expose, Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class ClinicDetailsManagerDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  displayName: string;

  @Expose()
  @IsString()
  email: string;
}

export class ClinicDetailsStatsDto {
  @Expose()
  @IsNumber()
  providerCount: number;

  @Expose()
  @IsNumber()
  patientCount: number;

  @Expose()
  @IsNumber()
  appointmentCount: number;
}

export class ClinicDetailsDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  organizationName: string;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClinicDetailsManagerDto)
  managers: ClinicDetailsManagerDto[];

  @Expose()
  @ValidateNested()
  @Type(() => ClinicDetailsStatsDto)
  stats: ClinicDetailsStatsDto;
}
