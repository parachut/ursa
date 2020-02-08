import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class AddressWhereUniqueInput {
  @Field(type => ID)
  id!: string;
}
