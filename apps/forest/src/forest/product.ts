import * as Liana from 'forest-express-sequelize';

Liana.collection('Product', {
    actions: [
        {
            name: 'Insert Product',
            type: 'global',

            fields: [
                {
                    field: 'url',
                    type: 'String',
                    isRequired: true,
                    description: "Insert product url from B&H website."
                },
                {
                    field: 'price',
                    type: 'String',
                    isRequired: true,
                    description: "Insert price, if the price does not appear on the B&H page"
                },
            ],
        },
    ],
});
