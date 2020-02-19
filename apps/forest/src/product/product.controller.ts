import { Body, Controller, Get, Post, UseGuards, BadRequestException, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InsertProductDto } from './dto/insert.dto';
import { BPService } from './insert.service';

@Controller()
export class BPController {
  constructor(private readonly insertService: BPService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/insert-product')
  async insertProduct(@Body() insert: InsertProductDto) {
    const bhUrl = insert.data.attributes.values.url;
    const bhPrice =insert.data.attributes.values.price

    if (bhUrl.includes("www.bhphotovideo.com") === false) {
      throw new BadRequestException("Wrong URL")
    }

    await this.insertService.insertItem(bhUrl,bhPrice)

    return {
      success: 'Product Inserted Successfully',
    }

  }
}
