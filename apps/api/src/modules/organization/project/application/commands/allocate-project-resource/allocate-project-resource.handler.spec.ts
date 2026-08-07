import { AllocateProjectResourceHandler } from './allocate-project-resource.handler';
import { AllocateProjectResourceCommand } from './allocate-project-resource.command';
import {
  ProjectAllocationConflictException,
  ProjectNotFoundException,
} from '@modules/organization/project/domain/exceptions/project.exceptions';
import { OverlappingAllocation } from '@modules/organization/project/domain/contracts/project.contracts';
import { ProjectResourceAllocation } from '@modules/organization/project/domain/entities/project-resource-allocation.entity';

describe('AllocateProjectResourceHandler (kaynak tahsisi)', () => {
  const clinicId = '11111111-1111-4111-8111-111111111111';
  const orgId = '22222222-2222-4222-8222-222222222222';
  const projectId = '33333333-3333-4333-8333-333333333333';
  const resourceId = '44444444-4444-4444-8444-444444444444';
  const ctx = {
    actor: { userId: '55555555-5555-4555-8555-555555555555', clinicId },
    source: 'WEB',
  } as never;

  const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

  function build(options: {
    overlapping?: OverlappingAllocation[];
    projectExists?: boolean;
    projectTerminal?: boolean;
  }) {
    const create = jest.fn((entity: ProjectResourceAllocation) =>
      Promise.resolve(entity)
    );
    const findOverlapping = jest
      .fn()
      .mockResolvedValue(options.overlapping ?? []);
    const allocationCommandRepo = { findOverlapping, create } as never;

    const projectCommandRepo = {
      findById: jest.fn().mockResolvedValue(
        options.projectExists === false
          ? null
          : {
              clinicId: { value: clinicId },
              organizationId: { value: orgId },
              assertAcceptsWork: jest.fn(() => {
                if (options.projectTerminal) throw new Error('terminal');
              }),
            }
      ),
    } as never;

    const phaseCommandRepo = { findById: jest.fn() } as never;

    const policyFactory = {
      project: () => ({
        evaluator: { check: () => ({ orThrow: jest.fn() }) },
      }),
    } as never;

    const txManager = {
      run: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as never;

    return {
      handler: new AllocateProjectResourceHandler(
        projectCommandRepo,
        phaseCommandRepo,
        allocationCommandRepo,
        policyFactory,
        txManager
      ),
      create,
      findOverlapping,
    };
  }

  const run = (
    handler: AllocateProjectResourceHandler,
    kind: 'EMPLOYEE' | 'ROOM' = 'EMPLOYEE',
    allocationPercent?: number
  ) =>
    handler.execute(
      new AllocateProjectResourceCommand({
        projectId,
        data: {
          kind,
          resourceId,
          startDate: day('2026-09-01'),
          endDate: day('2026-09-30'),
          allocationPercent,
        },
        ctx,
      })
    );

  const existing = (percent: number): OverlappingAllocation => ({
    id: 'other-alloc',
    projectId: 'other-project',
    startDate: day('2026-09-05'),
    endDate: day('2026-09-15'),
    allocationPercent: percent,
  });

  it('boş takvimde tahsis yapılır', async () => {
    const { handler, create } = build({});
    const id = await run(handler);
    expect(id).toBeTruthy();
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('personelin kalan kapasitesi yetiyorsa tahsis edilir', async () => {
    const { handler, create } = build({ overlapping: [existing(60)] });
    await run(handler, 'EMPLOYEE', 40);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('kapasite aşımında ProjectAllocationConflictException fırlatır', async () => {
    const { handler, create } = build({ overlapping: [existing(60)] });
    await expect(run(handler, 'EMPLOYEE', 50)).rejects.toBeInstanceOf(
      ProjectAllocationConflictException
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('çakışma hatası meta ile hangi projelerin doldurduğunu taşır', async () => {
    const { handler } = build({ overlapping: [existing(80)] });
    await expect(run(handler, 'EMPLOYEE', 50)).rejects.toMatchObject({
      meta: {
        allocatedPercent: 80,
        requestedPercent: 50,
        conflicts: [{ projectId: 'other-project', allocationPercent: 80 }],
      },
    });
  });

  it('oda tek bir çakışmada bile reddedilir', async () => {
    const { handler } = build({ overlapping: [existing(10)] });
    await expect(run(handler, 'ROOM')).rejects.toBeInstanceOf(
      ProjectAllocationConflictException
    );
  });

  it('oda tahsisinde yüzde 100e sabitlenir (istek yok sayılır)', async () => {
    const { handler, create } = build({});
    await run(handler, 'ROOM', 25);
    const saved = create.mock.calls[0][0];
    expect(saved.allocationPercent).toBe(100);
  });

  it('proje yoksa ProjectNotFoundException', async () => {
    const { handler } = build({ projectExists: false });
    await expect(run(handler)).rejects.toBeInstanceOf(ProjectNotFoundException);
  });

  it('çakışma sorgusu tahsis ile aynı transaction içinde çalışır', async () => {
    const { handler, findOverlapping } = build({});
    await run(handler);
    expect(findOverlapping).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicId,
        kind: 'EMPLOYEE',
        resourceId,
        startDate: day('2026-09-01'),
        endDate: day('2026-09-30'),
      })
    );
  });
});
