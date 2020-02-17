import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CancelCartDto } from './dto/cancel-cart.dto';
import { CartService } from './cart.service';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/cancel-cart')
  async cartCart(@Body() cancelCartDto: CancelCartDto) {
    const { ids } = cancelCartDto.data.attributes;

    for (const id of ids) {
      await this.cartService.cancel(id);
    }

    return {
      success: 'Cart(s) are canceled!',
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/confirm-cart')
  async confirmCart(@Body() cancelCartDto: CancelCartDto) {
    const { ids } = cancelCartDto.data.attributes;

    for (const id of ids) {
      await this.cartService.confirm(id);
    }

    return {
      success: 'Cart(s) are confirmed!',
    };
  }
}
