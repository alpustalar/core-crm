import { Expose, Type } from 'class-transformer';

/**
 * Açık slot okuma-modelleri. Slot verisi tanımı gereği randevu almaya sunulan
 * kamuya açık boşluktur — hasta kimliği içermez, bu yüzden tüm alanlar tabandadır.
 */
export class OpenSlotResponseDto {
  @Expose() time: string;

  @Expose()
  @Type(() => Date)
  start: Date;

  @Expose() durationMinutes: number;
}

/** Klinik geneli açık slot: hangi doktorun hangi anında boşluğu var. */
export class ClinicOpenSlotResponseDto {
  @Expose() providerId: string;
  @Expose() providerName: string;
  @Expose() time: string;

  @Expose()
  @Type(() => Date)
  start: Date;

  @Expose()
  @Type(() => Date)
  end: Date;

  @Expose() durationMinutes: number;
}

/** Bir güne ait (klinik yerelinde) tüm doktorların açık slotları. */
export class ClinicOpenSlotsDayResponseDto {
  @Expose() date: string;

  @Expose()
  @Type(() => ClinicOpenSlotResponseDto)
  slots: ClinicOpenSlotResponseDto[];
}
