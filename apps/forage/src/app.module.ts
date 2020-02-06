import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecurlyModule } from './recurly/recurly.module';
import { EasypostModule } from './easypost/easypost.module';

@Module({
  imports: [RecurlyModule, EasypostModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
