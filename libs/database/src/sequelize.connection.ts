import { readFileSync } from 'fs';
import { homedir } from 'os';
import { Sequelize } from 'sequelize-typescript';

import * as models from './entities';

export const sequelize = async () => {
  const connection = new Sequelize(
    'da4vhsd5as770l',
    '37CDm24TUX7sKMJWCCBUtxYRr',
    'CJC6QupaPb3rcR4r8dJpj8W77',
    {
      dialect: 'postgres',
      repositoryMode: true,
      logging: false,
      host: process.env.POSTGRES_HOST,
      dialectOptions: {
        ssl:
          process.env.NODE_ENV !== 'production'
            ? {
                ca: readFileSync(homedir + '/ursa-certs/server-ca.pem'),
                cert: readFileSync(homedir + '/ursa-certs/client.pem'),
                key: readFileSync(homedir + '/ursa-certs/client.key'),
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
  connection.addModels(Object.values(models));
  await connection.sync();
  return connection;
};
