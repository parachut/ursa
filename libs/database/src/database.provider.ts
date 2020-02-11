import { sequelize } from './sequelize.connection';

export const databaseProvider = {
  provide: 'SEQUELIZE',
  useFactory: () => {
    try {
      return sequelize();
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
};
