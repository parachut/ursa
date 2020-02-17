import { Body, Controller, Get, Post, UseGuards, BadRequestException, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from './invetory.service'


@Controller()
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    //   @UseGuards(AuthGuard('jwt'))
    //   @Post('/actions/export-commissions')


}