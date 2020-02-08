require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import * as requestIp from 'request-ip';

import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT;

  const app = await NestFactory.create(AppModule);

  app.use(requestIp.mw());

  await app.listen(port ? parseInt(port, 10) : 4000);
}

bootstrap();
