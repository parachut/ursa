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
            name: 'Export history',
            download: true,
        },
        {
            name: 'Export history',
            type: 'global',
            download: true,
        },
    ],
});
