import { Module } from '@nestjs/common';
import { EasyPostController } from '../easypost/easypost.controller'
import { EasyPostService } from '../easypost/easypost.service';
import { DatabaseModule } from '@app/database';
import { AuthModule } from '../auth/auth.module';
@Module({
    imports: [DatabaseModule, AuthModule],
    providers: [EasyPostService],
    controllers: [EasyPostController],
})
export class EasypostModule { }
