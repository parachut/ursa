import { AffiliateLink, User } from '@app/database/entities';
import { AffiliateLinkType } from '@app/database/enums';
import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { AffiliateLinkService } from './affiliate-link.service';

@Resolver(of => AffiliateLink)
export class AffiliateLinkResolver {
  constructor(private readonly affiliateLinkService: AffiliateLinkService) {}

  @Query(returns => AffiliateLink)
  @UseGuards(GqlAuthGuard)
  async affiliateLink(
    @Args('type') type: AffiliateLinkType,
    @CurrentUser() user: User,
  ): Promise<AffiliateLink> {
    return this.affiliateLinkService.findOne(type, user.id);
  }
}
