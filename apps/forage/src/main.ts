import { NestFactory } from '@nestjs/core';
import * as xmlparser from 'express-xml-bodyparser';
import { AppModule } from './app.module';

require('dotenv').config();
async function bootstrap() {
  const port = process.env.PORT;

  const app = await NestFactory.create(AppModule);

  app.use(
    xmlparser({
      explicitArray: false,
      normalize: false,
      normalizeTags: false,
      trim: true,
    }),
  );

  app.setGlobalPrefix('forage');

  await app.listen(port ? parseInt(port, 10) : 4000);
}
bootstrap();
