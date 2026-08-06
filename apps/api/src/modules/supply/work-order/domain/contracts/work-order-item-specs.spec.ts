import {
  WorkOrderItemSpecsSchema,
  type WorkOrderItemSpecs,
} from '@shared/modules/work-order/schemas';

/**
 * Çok-dikeyli `specs` sözleşmesi (@shared) — iş emri satırının sektöre özgü teknik
 * detayını taşır. Şema @shared'te yaşar, testi burada koşar (jest rootDir = apps/api/src).
 */
describe('WorkOrderItemSpecsSchema', () => {
  it('DENTAL — FDI diş numaraları kabul edilir', () => {
    const parsed = WorkOrderItemSpecsSchema.parse({
      kind: 'DENTAL',
      toothNumbers: [11, 21, 36],
      shade: 'A2',
      material: 'zirkonyum',
    });

    expect(parsed.kind).toBe('DENTAL');
    if (parsed.kind === 'DENTAL') {
      expect(parsed.toothNumbers).toEqual([11, 21, 36]);
    }
  });

  it('DENTAL — FDI aralığı dışındaki diş numarası reddedilir', () => {
    expect(() =>
      WorkOrderItemSpecsSchema.parse({ kind: 'DENTAL', toothNumbers: [9] })
    ).toThrow();
  });

  it('DENTAL — en az bir diş numarası zorunlu', () => {
    expect(() =>
      WorkOrderItemSpecsSchema.parse({ kind: 'DENTAL', toothNumbers: [] })
    ).toThrow();
  });

  it('HAIR — saç protezi alanları diş alanlarından bağımsız doğrulanır', () => {
    const parsed = WorkOrderItemSpecsSchema.parse({
      kind: 'HAIR',
      baseType: 'dantel',
      density: 85,
      colorCode: '#1B1B1B',
    });

    expect(parsed.kind).toBe('HAIR');
    // Diş alanı taşımadığı hâlde geçerli — dikeyler birbirini zorlamaz
    expect((parsed as Record<string, unknown>).toothNumbers).toBeUndefined();
  });

  it('GENERIC — modellenmemiş dikey için anahtar/değer', () => {
    const parsed = WorkOrderItemSpecsSchema.parse({
      kind: 'GENERIC',
      attributes: { olcu: 'M', renk: 'bej' },
    });

    if (parsed.kind === 'GENERIC') {
      expect(parsed.attributes.olcu).toBe('M');
    }
  });

  it('bilinmeyen kind reddedilir', () => {
    expect(() =>
      WorkOrderItemSpecsSchema.parse({ kind: 'ORTHOPEDIC', size: 42 })
    ).toThrow();
  });

  it('kind alanı olmayan payload reddedilir', () => {
    const invalid: unknown = { toothNumbers: [11] };
    expect(() => WorkOrderItemSpecsSchema.parse(invalid)).toThrow();
  });

  it('tip çıkarımı: WorkOrderItemSpecs union üyelerini kapsar', () => {
    const specs: WorkOrderItemSpecs = { kind: 'AESTHETIC', region: 'burun' };
    expect(specs.kind).toBe('AESTHETIC');
  });
});
