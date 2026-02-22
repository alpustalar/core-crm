import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID('4', { message: 'Geçerli bir hasta ID (UUID) girilmelidir.' })
  @IsNotEmpty({ message: 'Hasta seçimi zorunludur.' })
  patientId: string;

  @IsUUID('4', { message: 'Geçerli bir doktor ID (UUID) girilmelidir.' })
  @IsNotEmpty({ message: 'Doktor seçimi zorunludur.' })
  doctorId: string;

  @IsUUID('4', { message: 'Geçerli bir tedavi ID (UUID) girilmelidir.' })
  @IsNotEmpty({ message: 'Yapılacak işlem/tedavi seçilmelidir.' })
  treatmentId: string;

  @IsISO8601(
    {},
    {
      message:
        'Geçerli bir başlangıç tarihi giriniz (Örn: 2026-03-15T10:00:00Z).',
    },
  )
  @IsNotEmpty({ message: 'Randevu başlangıç saati boş bırakılamaz.' })
  startTime: string;

  @IsOptional()
  @IsNumber({}, { message: 'Süre rakam cinsinden (dakika) olmalıdır.' })
  @Min(1, { message: 'Randevu süresi en az 1 dakika olmalıdır.' })
  duration?: number;

  @IsOptional()
  @IsString({ message: 'Notlar metin formatında olmalıdır.' })
  notes?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Geçerli bir klinik ID girilmelidir.' })
  clinicId?: string;

  @IsOptional()
  @IsString({ message: 'Dış sistem referans ID hatalı.' })
  externalId?: string;
}
