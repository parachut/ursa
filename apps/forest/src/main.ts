require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { sequelize } from '@app/database';

async function bootstrap() {
  const port = process.env.PORT;

  const app = await NestFactory.create(AppModule);

  app.use(
    require('forest-express-sequelize').init({
      authSecret: process.env.FOREST_AUTH_SECRET,
      configDir: __dirname + '/forest',
      envSecret: process.env.FOREST_ENV_SECRET,
      sequelize: await sequelize(),
    }),
  );

  app.setGlobalPrefix('forest');

  await app.listen(port ? parseInt(port, 10) : 4000);
}
bootstrap();
