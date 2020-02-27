require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import requestIp from 'request-ip';
import CookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT;

  const app = await NestFactory.create(AppModule);

  app.use(requestIp.mw());

  app.use(CookieParser('VeYY*.KnkMW4Q_e'));

  await app.listen(port ? parseInt(port, 10) : 4000);
}

bootstrap();
