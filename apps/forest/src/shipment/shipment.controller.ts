
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import fetch from 'node-fetch';
import { ShipmentService } from './shipment.service'
import { ShipmentDto } from './dto/shipment.dto';

@Controller()
export class ShipmentController {
    constructor(
        private readonly shipmentService: ShipmentService
    ) { }


    @UseGuards(AuthGuard('jwt'))
    @Post('/actions/print-label')
    async printLabel(@Body() shipmentDto: ShipmentDto) {
        const { ids } = shipmentDto.data.attributes;

        const shipments = await this.shipmentService.findShipments(ids);

        for (const shipment of shipments) {
            const body = {
                printerId: 69114233,
                title: 'Shipping Label for ' + shipment.id,
                contentType: 'raw_uri',
                content: shipment.postage.labelZplUrl,
                source: 'EasyPost',
                expireAfter: 600,
                options: {},
            };

            await fetch('https://api.printnode.com/printjobs', {
                method: 'post',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:
                        'Basic ' +
                        Buffer.from('39duKfjG0etJ4YeQCk7WsHj2k_blwriaj9F-VPIBB5g').toString(
                            'base64',
                        ),
                },
            });

            return {
                success: 'Label(s) are printing!',
            };
        }
    }
}

