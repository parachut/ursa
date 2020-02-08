import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';

import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
    imports: [PassportModule],
    providers: [AuthService, LocalStrategy],
})
export class AuthModule { }
