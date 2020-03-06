import { Module } from '@nestjs/common';
import { BPController } from './product.controller';
import { InsertNewProductService } from './insert-new-product.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [InsertNewProductService],

  controllers: [BPController],
})
export class ProductModule { }
