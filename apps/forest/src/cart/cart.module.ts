import { DatabaseModule } from '@app/database';
import { EasyPostModule } from '@app/easypost';
import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [EasyPostModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
