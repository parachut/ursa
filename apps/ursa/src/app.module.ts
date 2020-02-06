import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RecurlyModule} from '../../forage/recurly/recurly.module'
import { AppService } from './app.service';
import { DatabaseModule } from '@app/database/database.module';

@Module({
  imports: [DatabaseModule, RecurlyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
