import { Field, InputType } from 'type-graphql';
import { MarketingSourceInput } from './marketing-source.input';

@InputType()
export class VisitCreateInput {
  @Field({ nullable: true })
  visitorId?: string;

  @Field({ nullable: true })
  affiliateId?: string;

  @Field()
  deviceId!: string;

  @Field(type => MarketingSourceInput, { nullable: true })
  marketingSource?: MarketingSourceInput;
}
