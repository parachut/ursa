import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './invetory.service';
import { CalculatorService } from '@app/calculator';
@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.FOREST_AUTH_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, CalculatorService, JwtStrategy]
  ,
})
export class InventoryModule { }
