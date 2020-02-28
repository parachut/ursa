import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { AffiliateLinkService } from './affiliate-link.service';
import { AffiliateLinkResolver } from './affiliate-link.resolver';

@Module({
  imports: [],
  providers: [AffiliateLinkService, AffiliateLinkResolver],
})
export class AffiliateLinkModule {}
