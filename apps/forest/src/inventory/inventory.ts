import Liana from 'forest-express-sequelize';

Liana.collection('Inventory', {
  actions: [
    {
      name: 'Export All Commissions',
      type: 'global',
      download: true,
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
    {
      name: 'Export Selected Commissions',
      download: true,
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
