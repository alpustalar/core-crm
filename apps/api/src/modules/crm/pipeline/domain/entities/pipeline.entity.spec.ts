import { Pipeline } from './pipeline.entity';
import { PipelineStage } from './pipeline-stage.entity';
import { randomUUID } from 'crypto';

describe('Pipeline entity', () => {
  const organizationId = randomUUID();
  const clinicId = randomUUID();

  it('create → id üretir, isDefault varsayılan false, isDeleted false', () => {
    const pipeline = Pipeline.create({
      organizationId,
      clinicId,
      name: 'Satış Hunisi',
    });

    expect(pipeline.id.value).toBeDefined();
    expect(pipeline.organizationId.value).toBe(organizationId);
    expect(pipeline.clinicId.value).toBe(clinicId);
    expect(pipeline.name).toBe('Satış Hunisi');
    expect(pipeline.isDefault).toBe(false);
    expect(pipeline.isDeleted).toBe(false);
  });

  it('create → isDefault ve verilen id korunur', () => {
    const id = randomUUID();
    const pipeline = Pipeline.create({
      id,
      organizationId,
      clinicId,
      name: 'Özel Huni',
      isDefault: true,
    });
    expect(pipeline.id.value).toBe(id);
    expect(pipeline.isDefault).toBe(true);
  });

  it('rename / markDefault / softDelete state değiştirir', () => {
    const pipeline = Pipeline.create({ organizationId, clinicId, name: 'A' });

    pipeline.rename('B');
    expect(pipeline.name).toBe('B');

    pipeline.markDefault(true);
    expect(pipeline.isDefault).toBe(true);

    pipeline.softDelete();
    expect(pipeline.isDeleted).toBe(true);
  });

  it('toPersistence tüm alanları düz shape olarak döner', () => {
    const pipeline = Pipeline.create({
      organizationId,
      clinicId,
      name: 'C',
      isDefault: true,
    });
    const raw = pipeline.toPersistence();

    expect(raw.id).toBe(pipeline.id.value);
    expect(raw.organizationId).toBe(organizationId);
    expect(raw.clinicId).toBe(clinicId);
    expect(raw.name).toBe('C');
    expect(raw.isDefault).toBe(true);
    expect(raw.isDeleted).toBe(false);
    expect(raw.createdAt).toBeInstanceOf(Date);
    expect(raw.updatedAt).toBeInstanceOf(Date);
  });
});

describe('PipelineStage entity', () => {
  const pipelineId = randomUUID();

  it('create → type varsayılan OPEN, isWon/isLost false', () => {
    const stage = PipelineStage.create({
      pipelineId,
      name: 'Yeni Lead',
      order: 0,
    });

    expect(stage.type).toBe('OPEN');
    expect(stage.order).toBe(0);
    expect(stage.isWon()).toBe(false);
    expect(stage.isLost()).toBe(false);
    expect(stage.color).toBeNull();
  });

  it('create(WON) → isWon true', () => {
    const stage = PipelineStage.create({
      pipelineId,
      name: 'Kazanıldı',
      order: 4,
      type: 'WON',
      color: '#34d399',
    });
    expect(stage.isWon()).toBe(true);
    expect(stage.isLost()).toBe(false);
    expect(stage.color).toBe('#34d399');
  });

  it('update → yalnız sağlanan alanlar değişir', () => {
    const stage = PipelineStage.create({
      pipelineId,
      name: 'Teklif',
      order: 3,
    });

    stage.update({ name: 'Teklif Gönderildi' });
    expect(stage.name).toBe('Teklif Gönderildi');
    expect(stage.order).toBe(3); // dokunulmadı

    stage.update({ order: 5, type: 'LOST', color: '#f87171' });
    expect(stage.order).toBe(5);
    expect(stage.isLost()).toBe(true);
    expect(stage.color).toBe('#f87171');
  });

  it('update(color: null) → renk temizlenir (isNotUndefined)', () => {
    const stage = PipelineStage.create({
      pipelineId,
      name: 'X',
      order: 1,
      color: '#fff',
    });
    stage.update({ color: null });
    expect(stage.color).toBeNull();
  });

  it('softDelete + toPersistence', () => {
    const stage = PipelineStage.create({ pipelineId, name: 'Y', order: 2 });
    stage.softDelete();
    const raw = stage.toPersistence();

    expect(raw.isDeleted).toBe(true);
    expect(raw.pipelineId).toBe(pipelineId);
    expect(raw.type).toBe('OPEN');
  });
});
