import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class ShipmentParcel {
  @Field(type => ID)
  id!: string;

  @Field()
  object!: string;

  @Field()
  mode!: string;

  @Field()
  length!: number;

  @Field()
  width!: number;

  @Field()
  height!: number;

  @Field()
  weight!: number;

  @Field({ nullable: true })
  predefinedPackage?: string;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
