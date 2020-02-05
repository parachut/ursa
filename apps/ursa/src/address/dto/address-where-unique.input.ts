import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class AddressWhereUniqueInput {
  @Field(type => ID)
  id!: string;
}
