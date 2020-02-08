require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import * as xmlparser from 'express-xml-bodyparser';
import { Logger } from '@nestjs/common'


import { AppModule } from './app.module';



async function bootstrap() {
  const logger = new Logger("bootstrap")
  const port = process.env.PORT;


  const app = await NestFactory.create(AppModule);


  app.use(xmlparser()); // parse text/xml requests
  //app.use('/easy_post', bodyparser())

  await app.listen(port ? parseInt(port, 10) : 4000);
  logger.log(`Application listening on port ${port}`)
}
bootstrap();
