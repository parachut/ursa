import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { ShipKitService } from './ship-kit.service'
import { ShipKitController } from './ship-kit.controller'
import { JwtStrategy } from '../jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as Liana from 'forest-express-sequelize';

@Module({
    imports: [DatabaseModule, PassportModule,
        JwtModule.register({
            secret: process.env.FOREST_AUTH_SECRET,
            signOptions: { expiresIn: '7d' },
        }),],
    controllers: [ShipKitController],
    providers: [ShipKitService, JwtStrategy],
})
export class ShipKitModule {

}
