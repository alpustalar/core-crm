import { SystemAdminGuard } from './system-admin.guard';

describe('SystemAdminGuard', () => {
  it('should be defined', () => {
    expect(new SystemAdminGuard()).toBeDefined();
  });
});
