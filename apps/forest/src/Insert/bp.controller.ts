import { Body, Controller, Get, Post, UseGuards, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InsertProductDto } from '../dto/insert.dto';
import { BPService } from './bp.service';

@Controller()
export class BPController {
  constructor(private readonly insertService: BPService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/insert-product')
  async insertProduct(@Body() insert: InsertProductDto) {
    await this.insertService.insertItem(insert.data.attributes.values)
    return {
      success: 'Product Inserted Successfully',
    }
  }
}
