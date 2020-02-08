import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class ShipKitUpdateInput {
  @Field({ nullable: true })
  addressId?: string;

  @Field({ nullable: true })
  airbox?: boolean;
}
