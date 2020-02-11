import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class AgreeToTermsInput {
  @Field()
  type!: string;
}
