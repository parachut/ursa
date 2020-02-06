import { Controller, Body, Post, Req, Get, Res, HttpStatus } from '@nestjs/common';
import { Plan } from '../../../libs/database/src/entities/plan.entity'
import { PlanService } from './plan.service';
import { Request, Response } from 'express';
//import { Response } from 'express';
import * as xmlparser from "express-xml-bodyparser";

@Controller('recurly/plan')
export class PlanController {

    //constructor(private readonly planService: PlanService) { }


    @Post()
    // @HttpCode(204)
    async  getBody(@Req() req: Request): Promise<any> {
        console.log('body', req.body)
        return req.body
    }

    @Get()
    async findAll(@Res() res: Response) {
        res.send("OK");
    }
}
