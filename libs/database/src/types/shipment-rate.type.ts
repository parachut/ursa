import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class ShipmentRate {
  @Field(type => ID)
  id!: string;

  @Field()
  object!: string;

  @Field()
  mode!: string;

  @Field()
  service!: string;

  @Field()
  carrier!: string;

  @Field({ nullable: true })
  carrierAccountId?: string;

  @Field()
  rate!: number;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  retailRate?: number;

  @Field({ nullable: true })
  listRate?: number;

  @Field({ nullable: true })
  listCurrency?: string;

  @Field({ nullable: true })
  deliveryDays?: number;

  @Field({ nullable: true })
  deliveryDate?: Date;

  @Field({ nullable: true })
  deliveryDateGuaranteed?: boolean;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
