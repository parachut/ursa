import Recurly from 'recurly';

import { User } from '../entities/user.entity';
import { UserIntegration } from '../entities/user-integration.entity';

const recurly = new Recurly.Client(process.env.RECURLY);

export async function createRecurlyUser(
  user: User,
): Promise<Partial<UserIntegration>> {
  const customer = await recurly.createAccount({
    code: user.id,
    firstName: user.parsedName.first,
    lastName: user.parsedName.last,
    email: user.email,
  });

  return {
    type: 'RECURLY',
    value: customer.id,
    userId: user.get('id'),
  };
}
