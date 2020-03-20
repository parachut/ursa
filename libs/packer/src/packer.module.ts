import { Module } from '@nestjs/common';
import { PackerService } from './packer.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [PackerService],
  exports: [PackerService],
})
export class PackerModule {}
