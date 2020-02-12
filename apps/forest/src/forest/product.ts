import * as Liana from 'forest-express-sequelize';

Liana.collection('Product', {
  actions: [
    {
      name: 'Add product',
      type: 'global',
      fields: [
        {
          field: 'Start date',
          type: 'Dateonly',
          isRequired: true,
        },
        {
          field: 'End date',
          type: 'Dateonly',
          isRequired: true,
        },
      ],
    },
  ],
});
