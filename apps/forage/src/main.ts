import { NestFactory } from '@nestjs/core';
import * as xmlparser from 'express-xml-bodyparser';

import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT;

  const app = await NestFactory.create(AppModule);
  app.use(xmlparser()); // parse text/xml requests

  await app.listen(port ? parseInt(port, 10) : 4000);
}
bootstrap();
