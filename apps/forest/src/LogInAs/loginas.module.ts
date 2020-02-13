import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LogInAsController } from './loginas.controller';
import { LogInAsService } from './loginas.service';
import { JwtStrategy } from '../jwt.strategy';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.FOREST_AUTH_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [LogInAsController],
  providers: [LogInAsService, JwtStrategy],
})
export class LogInAsModule { }
