import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { ProductAttribute } from './product-attribute.entity';
import { Product } from './product.entity';

@ObjectType()
@Table({
  tableName: 'product_attribute_values',
  underscored: true,
})
export class ProductAttributeValue extends Model<ProductAttributeValue> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Column
  value!: string;

  @ForeignKey(() => Product)
  @Column(DataType.UUID)
  productId!: string;

  @BelongsTo(() => Product)
  category: Product;

  @ForeignKey(() => ProductAttribute)
  @Column(DataType.UUID)
  productAttributeId!: string;

  @BelongsTo(() => ProductAttribute)
  attribute: ProductAttribute;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
