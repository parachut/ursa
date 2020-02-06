require('dotenv').config();

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import * as xmlparser from "express-xml-bodyparser";

async function bootstrap() {
  const port = process.env.PORT;

  const app = await NestFactory.create(
    AppModule,

  );
  app.use('/reculry/plan', xmlparser())


  await app.listen(port ? parseInt(port, 10) : 4000, '0.0.0.0');
}
bootstrap();
