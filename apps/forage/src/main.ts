import { NestFactory } from '@nestjs/core';
import CookieParser from 'cookie-parser';
import xmlparser from 'express-xml-bodyparser';

import { AppModule } from './app.module';

require('dotenv').config();
async function bootstrap() {
  const port = process.env.PORT;

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.use(
    xmlparser({
      explicitArray: false,
      normalize: false,
      normalizeTags: false,
      trim: true,
    }),
  );

  app.use(CookieParser('VeYY*.KnkMW4Q_e'));

  app.setGlobalPrefix('forage');

  await app.listen(port ? parseInt(port, 10) : 4000);
}
bootstrap();
