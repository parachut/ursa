import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { AffiliateLinkService } from './affiliate-link.service';
import { AffiliateLinkResolver } from './affiliate-link.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [AffiliateLinkService, AffiliateLinkResolver],
})
export class AffiliateLinkModule {}
