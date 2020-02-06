require('dotenv').config();

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT;

  const app = await NestFactory.create(AppModule);
  await app.listen(port ? parseInt(port, 10) : 4000);
}
bootstrap();
