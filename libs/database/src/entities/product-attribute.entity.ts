import {
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { ProductAttributeValue } from './product-attribute-value.entity';

@ObjectType()
@Table({
  tableName: 'product_attributes',
  underscored: true,
})
export class ProductAttribute extends Model<ProductAttribute> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Unique
  @Column
  name!: string;

  @HasMany(() => ProductAttributeValue, 'productAttributeId')
  values?: ProductAttributeValue[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
