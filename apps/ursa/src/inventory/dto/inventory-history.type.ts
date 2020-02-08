import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class InventoryHistory {
  @Field({ nullable: true })
  in?: Date;

  @Field()
  out!: Date;

  @Field()
  amount!: number;

  @Field()
  days!: number;

  @Field({ nullable: true })
  serial?: string;

  @Field({ nullable: true })
  name?: string;
}
