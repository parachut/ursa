import { Module } from '@nestjs/common';
import { BPController } from './bp.controller';
import { BPService } from './bp.service';
import { DatabaseModule } from '@app/database';
//import { AuthModule } from '../../auth/auth.module';
import { JwtStrategy } from '../jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [DatabaseModule, PassportModule,
    JwtModule.register({
      secret: process.env.FOREST_AUTH_SECRET,
      signOptions: { expiresIn: '7d' },
    }),],
  providers: [BPService, JwtStrategy],
  controllers: [BPController],
})
export class BPModule { }

