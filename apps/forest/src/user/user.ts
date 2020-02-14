import PhoneNumber from 'awesome-phonenumber';
import * as Liana from 'forest-express-sequelize';

import { User, UserVerification } from '@app/database/entities';

Liana.collection('User', {
  actions: [
    {
      name: 'Export proximity',
      type: 'global',
      download: true,
    },
    {
      name: 'Login as',
      type: 'single',
    },
    {
      name: 'Create ShipKit',
      type: 'single',
      fields: [
        {
          field: 'Airbox',
          type: 'Boolean',
          isRequired: false,
        },
      ],
    },
  ],
  fields: [
    {
      field: 'clearbitFraudScore',
      type: 'Enum',
      enums: ['low', 'medium', 'high'],
      isReadOnly: true,
      get: async (user: User) => {
        const [verification] = await user.$get('verifications', {
          where: {
            type: 'CLEARBIT_FRAUD',
          },
          order: [['createdAt', 'DESC']],
        });
        if (verification) {
          const meta = JSON.parse(verification.meta);
          return meta?.risk?.level;
        }
        return null;
      },
    },
    {
      field: 'formattedPhone',
      type: 'String',
      get: async (user: User) => {
        const pn = new PhoneNumber(user.phone);
        return pn.getNumber('national');
      },
      set: (user: User, phone: string) => {
        const pn = new PhoneNumber(phone, 'US');
        user.phone = pn.getNumber('e164');
        return user;
      },
    },
  ],
});
