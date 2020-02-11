import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class ShipmentPostageLabel {
  @Field(type => ID)
  id!: string;

  @Field()
  integratedForm!: string;

  @Field()
  object!: string;

  @Field()
  labelDate!: Date;

  @Field({ nullable: true })
  labelEpl2Url?: string;

  @Field({ nullable: true })
  labelFileType?: string;

  @Field({ nullable: true })
  labelPdfUrl?: string;

  @Field({ nullable: true })
  labelResoltuion?: number;

  @Field({ nullable: true })
  labelSize?: string;

  @Field({ nullable: true })
  labelType?: string;

  @Field({ nullable: true })
  labelUrl?: string;

  @Field({ nullable: true })
  labelZplUrl?: string;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
