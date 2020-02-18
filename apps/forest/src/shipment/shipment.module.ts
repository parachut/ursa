import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as Liana from 'forest-express-sequelize';
import { ShipmentService } from './shipment.service';
import { JwtStrategy } from '../jwt.strategy';
import { ShipmentController } from './shipment.controller';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.FOREST_AUTH_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [ShipmentController],
  providers: [ShipmentService, JwtStrategy],
})
export class ShipmentModule { }