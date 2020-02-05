import { Client as Authy } from 'authy-client';

import { User } from '../entities/user.entity';
import { UserIntegration } from '../entities/user-integration.entity';

export async function createAuthyUser(
  user: User,
): Promise<Partial<UserIntegration>> {
  const authy = new Authy({ key: process.env.AUTHY });

  const {
    user: { id: authyId },
  } = await authy.registerUser({
    countryCode: 'US',
    email: user.email,
    phone: user.phone,
  });

  return {
    type: 'AUTHY',
    value: authyId,
    userId: user.id,
  };
}
