import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class ReturnCompleteInput {
  @Field(type => [String])
  inventoryIds: string[];

  @Field({ nullable: true })
  reason: string;
}
