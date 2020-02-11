import { Field, InputType } from 'type-graphql';

@InputType()
export class MarketingSourceInput {
  @Field()
  campaign?: string;

  @Field()
  source?: string;

  @Field()
  medium?: string;
}
