import { Sequelize } from 'sequelize-typescript';
import { readFileSync } from 'fs';
// import { Cat } from '../cats/cat.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize(
        'da4vhsd5as770l',
        '37CDm24TUX7sKMJWCCBUtxYRr',
        'CJC6QupaPb3rcR4r8dJpj8W77',
        {
          dialect: 'postgres',
          modelPaths: [`${__dirname}/models`],
          logging: false,
          host: process.env.POSTGRES_HOST,
          dialectOptions: {
            ssl:
              process.env.NODE_ENV !== 'production'
                ? {
                    ca: readFileSync('~/ursa-certs/server-ca.pem'),
                    cert: readFileSync('~/ursa-certs/client.pem'),
                    key: readFileSync('~/ursa-certs/client.key'),
                    rejectUnauthorized: false,
                  }
                : undefined,
          },
          pool: {
            max: 20,
            idle: 30000,
          },
        },
      );
      // sequelize.addModels([Cat]);
      // await sequelize.sync();
      return sequelize;
    },
  },
];
