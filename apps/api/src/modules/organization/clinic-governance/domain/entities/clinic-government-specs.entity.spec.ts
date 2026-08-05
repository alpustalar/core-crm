import {
  InvalidVknChecksumException,
  InvalidVknFormatException,
} from '@src/domain/exceptions';
import { Vkn } from '@src/domain/value-objects/vkn.vo';
import { ClinicGovernmentSpecs } from './clinic-government-specs.entity';

describe('ClinicGovernmentSpecs', () => {
  const base = { clinicId: 'clinic-1', healthFacilityCode: 'SKRS-001' };

  it('geçerli VKN ile create: getter Vkn döner, toPersistence string yazar', () => {
    const e = ClinicGovernmentSpecs.create({
      ...base,
      companyTaxNumber: '1234567890',
    });
    expect(e.companyTaxNumber).toBeInstanceOf(Vkn);
    expect(e.companyTaxNumber!.value).toBe('1234567890');
    expect(e.toPersistence().companyTaxNumber).toBe('1234567890');
  });

  it('companyTaxNumber opsiyonel (null) olabilir', () => {
    const e = ClinicGovernmentSpecs.create({ ...base });
    expect(e.companyTaxNumber).toBeNull();
    expect(e.toPersistence().companyTaxNumber).toBeNull();
  });

  it('geçersiz VKN create sırasında reddedilir', () => {
    expect(() =>
      ClinicGovernmentSpecs.create({ ...base, companyTaxNumber: '1234567891' })
    ).toThrow(InvalidVknChecksumException);
  });

  it('update: VKN değiştirir ve null’a çekebilir', () => {
    const e = ClinicGovernmentSpecs.create({
      ...base,
      companyTaxNumber: '1234567890',
    });
    e.update({ companyTaxNumber: '1111111114' });
    expect(e.companyTaxNumber!.value).toBe('1111111114');
    e.update({ companyTaxNumber: null });
    expect(e.companyTaxNumber).toBeNull();
  });

  it('update: geçersiz VKN reddedilir', () => {
    const e = ClinicGovernmentSpecs.create({
      ...base,
      companyTaxNumber: '1234567890',
    });
    expect(() => e.update({ companyTaxNumber: '12' })).toThrow(
      InvalidVknFormatException
    );
  });
});
