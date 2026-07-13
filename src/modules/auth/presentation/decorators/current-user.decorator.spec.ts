import { ExecutionContext } from '@nestjs/common';
import { Role } from '../../domain/role.enum';
import { extractCurrentUser } from './current-user.decorator';

describe('extractCurrentUser', () => {
  it('extracts the authenticated user from the request', () => {
    const user = { id: 'u-1', email: 'admin@example.com', role: Role.ADMIN };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;

    expect(extractCurrentUser(ctx)).toBe(user);
  });
});
