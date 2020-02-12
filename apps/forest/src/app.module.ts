import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategy } from './jwt.strategy';
import { BPModule } from './Insert/bp.module';
import { LogInAssModule } from './LogInAs/loginas.module';
import { EmailService } from './email.service';

@Module({
  //exports:[],
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.FOREST_AUTH_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    BPModule,
    LogInAssModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, EmailService],
})
export class AppModule { }
