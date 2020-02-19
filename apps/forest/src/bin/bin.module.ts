import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { BinController } from './bin.controller';
import { BinService } from './bin.service';

@Module({
    imports: [
        DatabaseModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.FOREST_AUTH_SECRET,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [BinController],
    providers: [BinService,
        JwtStrategy
    ]
    ,
})
export class BinModule { }
