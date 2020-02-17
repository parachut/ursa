import { Body, Controller, Get, Post, UseGuards, BadRequestException, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ShipKitService } from './ship-kit.service'


@Controller()
export class ShipKitController {
    constructor(private readonly inventoryService: ShipKitService) { }

    //   @UseGuards(AuthGuard('jwt'))
    //   @Post('/actions/create-shipkit')


}