import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategy } from './jwt.strategy';
import { BPModule } from './product/product.module';
import { LogInAsModule } from './user/user.module';
import { EmailService } from './user/email.service';

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
    LogInAsModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, EmailService],
})
export class AppModule { }
