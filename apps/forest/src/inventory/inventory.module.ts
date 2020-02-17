import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { InventoryController } from './inventory.controller';
import * as Liana from 'forest-express-sequelize';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.FOREST_AUTH_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [JwtStrategy, InventoryController],
  providers: [],
})
export class InventoryModule {}
