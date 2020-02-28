require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import CookieParser from 'cookie-parser';
import requestIp from 'request-ip';

import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT;
  const app = await NestFactory.create(AppModule);
  app.use(CookieParser('VeYY*.KnkMW4Q_e'));

  app.use(requestIp.mw());

  await app.listen(port ? parseInt(port, 10) : 4000);
}
bootstrap();
