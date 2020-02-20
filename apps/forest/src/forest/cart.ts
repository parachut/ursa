import * as Liana from 'forest-express-sequelize';

Liana.collection('Cart', {
  actions: [
    {
      name: 'Confirm cart',
    },
    {
      name: 'Cancel cart',
    },
    {
      name: 'Export All History',
      type: 'global',
      download: true,
    },
    {
      name: 'Export Selected History',
      download: true,
    },
  ],
});
