import { Module } from '@nestjs/common';
import { BPController } from './product.controller';
import { BPService } from './insert.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [BPService],
  controllers: [BPController],
})
export class ProductModule { }

